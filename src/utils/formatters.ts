export function formatarData(data: string | Date | undefined): string {
    if (!data) return '';
    
    const dataString = String(data);
    
    // Se for string no formato YYYY-MM-DD, extrai direto
    if (dataString.includes('-')) {
        const primeiraParticao = dataString.split('T');
        if (primeiraParticao.length > 0 && primeiraParticao[0]) {
            const semHora = primeiraParticao[0];
            const partes = semHora.split('-');
            
            if (partes.length === 3 && partes[0] && partes[1] && partes[2]) {
                return `${partes[2]}/${partes[1]}/${partes[0]}`;
            }
        }
    }
    
    // Se for Date, converte normalmente
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

export function formatarDataHora(data: string | Date): string {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
}