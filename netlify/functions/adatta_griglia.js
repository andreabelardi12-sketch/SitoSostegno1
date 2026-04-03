exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Metodo non consentito" };

    try {
        const body = JSON.parse(event.body);
        
        // Qui Netlify andrà a leggere la tua chiave segreta!
        const apiKey = process.env.GEMINI_API_KEY;
        
        const prompt = `Sei un docente di sostegno esperto in pedagogia speciale e stesura del PEI. 
        Il tuo compito è prendere una griglia di valutazione standard e adattarla al Profilo di Funzionamento di uno specifico alunno con disabilità.
        
        REGOLA FONDAMENTALE: Devi mantenere assolutamente la stessa struttura della griglia (stessi criteri, stessi voti o livelli), ma devi RISCRIVERE SOLO LA DESCRIZIONE DEI DESCRITTORI. 
        I nuovi descrittori devono essere realistici, misurabili e calibrati sulle effettive capacità dell'alunno descritte nel suo Profilo di Funzionamento. Usa un formato a tabella o a elenco puntato chiaro.
        
        Ecco il Profilo di Funzionamento dell'alunno:
        ${body.profilo}
        
        Ecco la griglia originale da rielaborare:
        ${body.griglia}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message || "Errore da Google");

        return { statusCode: 200, body: JSON.stringify({ risultato: data.candidates[0].content.parts[0].text }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};