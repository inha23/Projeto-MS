// Variáveis globais
let pipe = null;
let articleContent = null;

// Temas de artigos para melhor geração
const articleThemes = {
    introduction: [
        "Descubra por que {product} está revolucionando o mercado.",
        "Se você está procurando qualidade e inovação, {product} é a resposta.",
        "Conhece {product}? Saiba tudo sobre este produto incrível.",
        "Exploramos {product} em detalhes e compartilhamos nossa análise completa."
    ],
    features: [
        "Características principais que fazem diferença",
        "O que torna {product} especial no mercado",
        "Funcionalidades que você precisa conhecer",
        "Diferenciais que destacam este produto"
    ],
    benefits: [
        "Vantagens que transformam sua experiência",
        "Por que investir em {product}",
        "Benefícios práticos do uso diário",
        "Como {product} melhora sua vida"
    ],
    comparison: [
        "Como {product} se compara com concorrentes",
        "Por que {product} é a melhor opção",
        "Análise comparativa no mercado",
        "Diferenciais competitivos"
    ],
    quality: [
        "Qualidade garantida e durabilidade",
        "Avaliação de qualidade e performance",
        "O que esperamos de um bom produto",
        "Padrões de excelência em {product}"
    ],
    conclusion: [
        "Nossa opinião final sobre {product}",
        "Vale realmente a pena? Conclusões",
        "O veredito final após análise completa",
        "Recomendamos {product}? Descubra aqui"
    ]
};

// Estrutura de seções
const sections = {
    3: ['introduction', 'features', 'conclusion'],
    5: ['introduction', 'features', 'benefits', 'quality', 'conclusion'],
    7: ['introduction', 'features', 'benefits', 'comparison', 'quality', 'experience', 'conclusion']
};

const sectionTopics = {
    introduction: "Introdução ao Produto",
    features: "Principais Características",
    benefits: "Benefícios Principais",
    comparison: "Comparação com Concorrentes",
    quality: "Qualidade e Durabilidade",
    experience: "Experiência do Usuário",
    conclusion: "Conclusão Final"
};

// Inicializar a IA quando a página carregar
window.addEventListener('load', async () => {
    console.log('Iniciando carregamento da IA...');
    showAlert('info', 'Carregando modelo de IA... Isso pode levar um tempo na primeira vez.');
    
    try {
        // Usar pipeline de text-generation do Transformers.js
        const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0');
        pipe = await pipeline('text2text-generation', 'Xenova/flan-t5-small');
        console.log('IA carregada com sucesso!');
        hideAlert();
    } catch (error) {
        console.error('Erro ao carregar IA:', error);
        showAlert('error', 'Erro ao carregar o modelo de IA. Tente recarregar a página.');
    }
});

// Event listener do formulário
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!pipe) {
        showAlert('error', 'IA ainda está carregando. Aguarde alguns segundos.');
        return;
    }

    // Validar campos obrigatórios
    const productName = document.getElementById('productName').value.trim();
    const affiliateLink = document.getElementById('affiliateLink').value.trim();

    if (!productName || !affiliateLink) {
        showAlert('error', 'Por favor, preencha os campos obrigatórios.');
        return;
    }

    // Mostrar loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('submitBtn').disabled = true;
    hideAlert();

    try {
        await generateArticle();
    } catch (error) {
        console.error('Erro:', error);
        showAlert('error', 'Erro ao gerar artigo: ' + error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('submitBtn').disabled = false;
    }
});

// Gerar artigo
async function generateArticle() {
    const productName = document.getElementById('productName').value.trim();
    const productUrl = document.getElementById('productUrl').value.trim();
    const productDescription = document.getElementById('productDescription').value.trim();
    const productBenefits = document.getElementById('productBenefits').value.trim();
    const affiliateLink = document.getElementById('affiliateLink').value.trim();
    const tone = document.getElementById('tone').value;
    const numSections = document.getElementById('sections').value;

    let html = '';

    // Gerar cada seção
    const sectionsToGenerate = sections[numSections];
    
    for (let i = 0; i < sectionsToGenerate.length; i++) {
        const section = sectionsToGenerate[i];
        const sectionTitle = sectionTopics[section];
        
        console.log(`Gerando seção: ${section}`);
        
        // Criar prompt inteligente baseado na seção
        let prompt = createPrompt(section, productName, productDescription, productBenefits, tone);
        
        try {
            // Gerar texto com IA
            const result = await pipe(prompt, {
                max_new_tokens: 200,
                temperature: 0.8,
            });
            
            let content = result[0].generated_text;
            
            // Limpar conteúdo gerado
            content = cleanGeneratedText(content);
            
            html += `<h4>${sectionTitle}</h4>\n`;
            html += `<p>${content}</p>\n\n`;
            
            // Pequeno delay para não sobrecarregar
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`Erro ao gerar seção ${section}:`, error);
            html += `<h4>${sectionTitle}</h4>\n`;
            html += `<p>Conteúdo sobre ${productName}...</p>\n\n`;
        }
    }

    // Criar conteúdo do artigo
    articleContent = {
        title: `${productName} - Análise Completa`,
        subtitle: `Descubra tudo que você precisa saber sobre ${productName}`,
        content: html,
        productUrl: productUrl,
        affiliateLink: affiliateLink,
        productName: productName,
        date: new Date().toLocaleDateString('pt-BR')
    };

    // Mostrar preview
    displayPreview();
    showAlert('success', 'Artigo gerado com sucesso! 🎉');
}

// Criar prompt inteligente
function createPrompt(section, productName, description, benefits, tone) {
    const toneDescriptions = {
        professional: "de forma profissional e técnica",
        casual: "de forma casual e amigável",
        technical: "com detalhes técnicos e específicos",
        persuasive: "de forma persuasiva e convincente"
    };

    const baseContext = `Descreva sobre ${productName}`;
    const contextDescription = description ? ` que tem as seguintes características: ${description}` : '';
    const contextBenefits = benefits ? ` Seus benefícios incluem: ${benefits}` : '';
    
    const prompts = {
        introduction: `${baseContext}${contextDescription}. Escreva uma introdução interessante ${toneDescriptions[tone]}, apresentando o produto e por que é importante.`,
        
        features: `Descreva as principais características e funcionalidades de ${productName}${contextDescription}. Explique cada uma ${toneDescriptions[tone]}.`,
        
        benefits: `Explique os benefícios de usar ${productName}${contextBenefits}. Como isso melhora a vida do usuário? Responda ${toneDescriptions[tone]}.`,
        
        comparison: `Compare ${productName} com produtos similares no mercado. Qual é seu diferencial? Analise ${toneDescriptions[tone]}.`,
        
        quality: `Avalie a qualidade, durabilidade e performance de ${productName}${contextDescription}. O que esperar ao usar este produto?`,
        
        experience: `Descreva como é a experiência do usuário ao usar ${productName}. Como é prático e fácil de usar? Explique ${toneDescriptions[tone]}.`,
        
        conclusion: `Resuma os pontos principais sobre ${productName} e recomende este produto. Por que vale a pena investir? Conclua ${toneDescriptions[tone]}.`
    };

    return prompts[section] || prompts.introduction;
}

// Limpar texto gerado
function cleanGeneratedText(text) {
    // Remover caracteres especiais indesejados
    text = text.replace(/[<>{}]/g, '');
    
    // Remover URLs duplicadas
    text = text.replace(/https?:\/\/[^\s]+/g, '');
    
    // Remover múltiplos espaços
    text = text.replace(/\s+/g, ' ');
    
    // Remover espaços no início e fim
    text = text.trim();
    
    // Garantir que termina com ponto
    if (!text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?')) {
        text += '.';
    }
    
    return text;
}

// Exibir preview
function displayPreview() {
    const productName = articleContent.productName;
    const affiliateLink = articleContent.affiliateLink;
    
    let previewHTML = `
        <h3>${articleContent.title}</h3>
        <p style="font-style: italic; color: #666; margin-bottom: 20px;">${articleContent.subtitle}</p>
        <p style="font-size: 0.85em; color: #999; margin-bottom: 20px;">Publicado em ${articleContent.date}</p>
        
        <div class="article-content">
            ${articleContent.content}
            
            <button class="affiliate-button" onclick="window.open('${affiliateLink}', '_blank')">
                🛒 Comprar ${productName} Agora
            </button>
        </div>
    `;
    
    document.getElementById('preview').innerHTML = previewHTML;
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('copyBtn').style.display = 'block';
}

// Fazer download HTML
function downloadHTML() {
    if (!articleContent) return;

    const htmlContent = generateFullHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${articleContent.productName.replace(/\s+/g, '-')}-artigo.html`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('success', 'Arquivo HTML baixado com sucesso!');
}

// Copiar HTML
function copyHTML() {
    if (!articleContent) return;

    const htmlContent = generateFullHTML();
    navigator.clipboard.writeText(htmlContent).then(() => {
        showAlert('success', 'Código HTML copiado para a área de transferência!');
    }).catch(() => {
        showAlert('error', 'Erro ao copiar código.');
    });
}

// Gerar HTML completo
function generateFullHTML() {
    const productName = articleContent.productName;
    const title = articleContent.title;
    const subtitle = articleContent.subtitle;
    const content = articleContent.content;
    const affiliateLink = articleContent.affiliateLink;
    const date = articleContent.date;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            margin-bottom: 40px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }

        header p {
            font-size: 1.1em;
            opacity: 0.9;
            margin-bottom: 15px;
        }

        .date {
            font-size: 0.9em;
            opacity: 0.8;
        }

        article {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 40px;
        }

        article h2 {
            color: #667eea;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 1.5em;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }

        article h4 {
            color: #764ba2;
            margin-top: 25px;
            margin-bottom: 12px;
            font-size: 1.2em;
        }

        article p {
            margin-bottom: 15px;
            text-align: justify;
            line-height: 1.8;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 18px 40px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 1.1em;
            margin-top: 30px;
            transition: transform 0.3s, box-shadow 0.3s;
            text-align: center;
            display: block;
            width: 100%;
        }

        .cta-button:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);
        }

        footer {
            text-align: center;
            color: #999;
            font-size: 0.9em;
            padding: 20px;
        }

        @media (max-width: 768px) {
            header h1 {
                font-size: 1.5em;
            }

            article {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${title}</h1>
            <p>${subtitle}</p>
            <p class="date">Publicado em ${date}</p>
        </header>

        <article>
            ${content}
            
            <a href="${affiliateLink}" class="cta-button" target="_blank">
                🛒 Comprar ${productName} Agora
            </a>
        </article>

        <footer>
            <p>Este conteúdo foi gerado automaticamente com IA. | Link de afiliado incluído.</p>
        </footer>
    </div>
</body>
</html>`;
}

// Funções auxiliares
function showAlert(type, message) {
    let alertEl;
    if (type === 'error') {
        alertEl = document.getElementById('alertError');
    } else if (type === 'success') {
        alertEl = document.getElementById('alertSuccess');
    } else {
        return;
    }
    
    alertEl.textContent = message;
    alertEl.style.display = 'block';
    
    // Auto-fechar após 5 segundos
    setTimeout(() => {
        alertEl.style.display = 'none';
    }, 5000);
}

function hideAlert() {
    document.getElementById('alertError').style.display = 'none';
    document.getElementById('alertSuccess').style.display = 'none';
}