"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  "Alimentacao", "Transporte", "Saude", "Assinaturas",
  "Lazer", "Moradia", "Educacao", "Outros",
];

interface ManualEntry {
  id: number;
  desc: string;
  value: number;
  type: "gasto" | "receita";
  category: string;
}

export default function TestDrivePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [revenue, setRevenue] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [entries, setEntries] = useState<ManualEntry[]>([]);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Manual form
  const [desc, setDesc] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<"gasto" | "receita">("gasto");
  const [category, setCategory] = useState("Alimentacao");

  const hasData = entries.length > 0 || uploadDone;
  const canGo = hasData && parseFloat(revenue) > 0;

  function addEntry() {
    if (!desc.trim() || !value || parseFloat(value) <= 0) return;
    setEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        desc: desc.trim(),
        value: parseFloat(value),
        type,
        category,
      },
    ]);
    setDesc("");
    setValue("");
  }

  function removeEntry(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const handleFile = useCallback((file: File) => {
    setUploading(true);
    setUploadProgress(0);
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadDone(true);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function goToDashboard() {
    if (!canGo) return;
    // Store data in sessionStorage for test-drive mode
    sessionStorage.setItem("testDrive", "true");
    sessionStorage.setItem("testDriveRevenue", revenue);
    sessionStorage.setItem(
      "testDriveEntries",
      JSON.stringify(entries)
    );
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex justify-center px-4 py-12" data-testid="screen-testdrive">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="text-text-secondary hover:text-text-primary text-sm mb-6 inline-block"
          data-testid="testdrive-back"
        >
          &larr; Voltar
        </Link>

        <h2 className="text-2xl font-bold mb-2">Test Drive</h2>
        <p className="text-text-secondary mb-8">
          Experimente o Cash Tracking sem compromisso. Importe um extrato ou
          adicione dados manualmente para ver o dashboard em acao.
        </p>

        {/* Revenue */}
        <div className="bg-bg-card rounded-xl p-6 border border-border mb-6">
          <h3 className="font-semibold mb-3">Qual sua receita neste mes?</h3>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary font-mono">R$</span>
            <input
              type="number"
              data-testid="testdrive-revenue"
              placeholder="Ex: 3500.00"
              step="0.01"
              min="0"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-bg-primary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent font-mono"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "upload"
                ? "bg-accent text-white"
                : "bg-bg-card text-text-secondary hover:text-text-primary"
            }`}
            data-testid="tab-upload"
            onClick={() => setActiveTab("upload")}
          >
            Upload de extrato
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "manual"
                ? "bg-accent text-white"
                : "bg-bg-card text-text-secondary hover:text-text-primary"
            }`}
            data-testid="tab-manual"
            onClick={() => setActiveTab("manual")}
          >
            Inclusao manual
          </button>
        </div>

        {/* Upload tab */}
        {activeTab === "upload" && (
          <div data-testid="tab-content-upload" className="mb-6">
            <div
              className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-accent transition-colors"
              data-testid="testdrive-dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="text-4xl mb-3">&#128196;</div>
              <p className="text-text-secondary mb-1">
                Arraste seu extrato aqui ou clique para simular
              </p>
              <span className="text-text-muted text-sm">
                PDF, CSV ou OFX &mdash; ate 10MB
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              data-testid="testdrive-file-input"
              accept=".pdf,.csv,.ofx,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            {uploading && (
              <div className="mt-4" data-testid="testdrive-progress">
                <div className="w-full bg-bg-primary rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                    data-testid="testdrive-progress-fill"
                  />
                </div>
              </div>
            )}
            {uploadDone && (
              <div className="mt-4 p-4 bg-bg-card rounded-lg border border-success/30 text-success text-sm" data-testid="upload-success-area">
                Extrato processado com sucesso!
              </div>
            )}
          </div>
        )}

        {/* Manual tab */}
        {activeTab === "manual" && (
          <div data-testid="tab-content-manual" className="mb-6">
            <div className="bg-bg-card rounded-xl p-4 border border-border mb-4">
              <input
                type="text"
                data-testid="manual-desc"
                placeholder="Ex: Supermercado"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent mb-3"
              />
              <div className="flex gap-3 mb-3">
                <input
                  type="number"
                  data-testid="manual-value"
                  placeholder="Valor (R$)"
                  step="0.01"
                  min="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-bg-primary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent font-mono"
                />
                <select
                  data-testid="manual-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as "gasto" | "receita")}
                  className="px-4 py-3 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="gasto">Gasto</option>
                  <option value="receita">Receita</option>
                </select>
              </div>
              <div className="flex gap-3">
                <select
                  data-testid="manual-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  className="px-6 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold transition-colors"
                  data-testid="btn-add-manual"
                  onClick={addEntry}
                >
                  + Adicionar
                </button>
              </div>
            </div>

            {entries.length > 0 && (
              <div className="space-y-2" data-testid="manual-entries-list">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between bg-bg-card rounded-lg px-4 py-3 border border-border"
                  >
                    <div>
                      <span className="text-text-primary">{entry.desc}</span>
                      <span className="text-text-muted text-sm ml-2">
                        {entry.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono font-medium ${
                          entry.type === "receita" ? "text-success" : "text-danger"
                        }`}
                      >
                        {entry.type === "receita" ? "+" : "-"}{" "}
                        {formatCurrency(entry.value)}
                      </span>
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="text-text-muted hover:text-danger transition-colors"
                        data-testid={`remove-entry-${entry.id}`}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <button
          className="w-full py-3 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="btn-go-dashboard"
          disabled={!canGo}
          onClick={goToDashboard}
        >
          Ver meu dashboard &rarr;
        </button>
      </div>
    </div>
  );
}
