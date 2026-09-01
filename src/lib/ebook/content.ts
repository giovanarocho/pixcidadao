/**
 * Conteúdo da landing page — CONTEÚDO REAL, enviado pelo cliente em
 * 28/08/2026 (arquivo "02 - Informações 28-08.docx").
 *
 * O e-book de teste (PDF placeholder) continua sendo usado em
 * `src/private-content/ebook.pdf` até o arquivo final ser entregue — é só
 * trocar esse arquivo quando ele existir, nenhum outro ponto do site precisa
 * mudar por causa disso.
 */

export const site = {
  name: "Pix Cidadão",
  domain: "pixcidadao.app.br",
  // TEMPORÁRIO: preço rebaixado para R$ 1,00 só para testar o Pix real sem
  // gastar o valor cheio. Antes de divulgar para o público, volte para
  // priceLabel: "R$ 37,90" e priceCents: 3790.
  priceLabel: "R$ 1,00",
  priceCents: 100, // usado pela API/checkout — mantenha em sincronia com priceLabel
  comissaoComunicadorPct: 90, // % do valor líquido destinado ao comunicador indicado
};

export const hero = {
  eyebrow: "E-book digital · Entrega imediata",
  titlePrefix: "Conheça o ",
  titleEmphasis: "Pix Cidadão",
  titleSuffix: " e financie o comunicador que você acompanha.",
  lede: "Uma proposta de renda básica de R$ 600 para todo mundo, com direcionamento estratégico para fortalecer a economia local, o trabalho com sentido e a regeneração ambiental. Entenda de onde ela vem, como funciona e os argumentos a favor e contra.",
  ctaPrimary: "Comprar agora",
  ctaSecondary: "Ver do que se trata",
  bookPages: "leitura acessível",
};

export const features = [
  {
    title: "Linguagem acessível",
    text: "Sem economês, sem jargão técnico. Escrito para quem quer entender a proposta de verdade, mesmo sem ser da área.",
  },
  {
    title: "Debate, não cartilha",
    text: "O objetivo não é te convencer, é colocar uma ideia potente em discussão — com os argumentos a favor e contra.",
  },
  {
    title: "Financia comunicação independente",
    text: "90% do valor líquido de cada venda feita por indicação vai direto para o comunicador que compartilhou o link.",
  },
];

export const chapters = [
  {
    title: "O que é o Pix Cidadão",
    text: "A proposta de renda básica de R$ 600 por pessoa, com direcionamento estratégico da renda.",
  },
  {
    title: "De onde ela vem",
    text: "Como o Pix Cidadão se conecta a uma política pública já aprovada no Brasil, a Lei 10.835/2004.",
  },
  {
    title: "Como seria financiada",
    text: "As possibilidades de financiamento discutidas para viabilizar a proposta.",
  },
  {
    title: "Argumentos a favor e contra",
    text: "Um panorama honesto do debate, para você formar sua própria opinião.",
  },
  {
    title: "A Rede de Comunicadores",
    text: "Como criadores independentes divulgam a proposta e são financiados diretamente por isso.",
  },
];

export const priceSection = {
  tag: "Acesso imediato",
  note: "Pix · sem parcelamento, sem taxa extra para você, sem cadastro de cartão.",
  bullets: [
    "PDF liberado na hora após a confirmação do Pix",
    "Leitura direto no celular, tablet ou computador",
    "90% do valor vai para o comunicador que te indicou (quando houver)",
  ],
  cta: "Quero meu e-book agora",
  hint: "Pagamento processado com segurança via Pix",
};

export const impact = {
  title: "Sua compra financia comunicação independente",
  text: "Quando você compra pelo link de um comunicador da rede, 90% do valor líquido vai direto para quem produz o conteúdo que você acompanha — sem depender de publicidade, algoritmos ou grandes plataformas. Os {comunicadores} continuam levando essa proposta adiante, com seus próprios formatos e opiniões.",
  highlight: "comunicadores",
};

export const network = {
  title: "Rede de Comunicadores pelo Pix Cidadão",
  cardTitle: "Comunicação independente também precisa de financiamento independente",
  text: "Cada comunicador da rede recebe um link exclusivo para divulgar o e-book. Quando alguém compra por esse link, 90% do valor líquido vai direto para ele — não é preciso transformar todo conteúdo em propaganda do Pix Cidadão, mas é uma forma real de gerar renda extra enquanto o tema circula.",
  refExample: "pixcidadao.app.br/?ref=seu-codigo",
  bullets: [
    "Não precisa ser influenciador — vale para quem tem público pequeno, médio ou grande",
    "Você não precisa concordar com tudo: pode apresentar, criticar e propor melhorias",
    "Acompanhamento de vendas pelo seu link, direto no seu painel de comunicador",
  ],
  formTitle: "Quer participar?",
  formText: "Preencha o formulário abaixo. Depois da aprovação, você recebe seu link individual de indicação e acesso ao seu painel de vendas.",
  ctaLabel: "Quero ser comunicador",
  avatars: ["JS", "MA", "RC"],
  moreLabel: "+12",
};

export const faq = [
  {
    q: "O que é o Pix Cidadão?",
    a: "É uma proposta de adendo a uma política pública já aprovada no Brasil (Lei 10.835/2004), que busca implementar uma renda básica de cidadania com mecanismos de direcionamento estratégico da renda para fortalecer a economia, o bem-estar da população e a regeneração ambiental. O e-book apresenta a proposta, seus fundamentos, possibilidades de financiamento e os principais argumentos do debate.",
  },
  {
    q: "O que eu recebo ao comprar o e-book?",
    a: "Acesso à versão digital (PDF) do e-book \"Pix Cidadão — Renda Básica de Cidadania com Direcionamento Estratégico\", para leitura no celular, tablet ou computador, liberado automaticamente após a confirmação do Pix.",
  },
  {
    q: "Quanto custa e como pago?",
    a: "O e-book custa R$ 37,90. Nesta primeira versão, o pagamento é feito exclusivamente por Pix — o que fortalece a própria proposta e não direciona dinheiro para empresas de cartão.",
  },
  {
    q: "Para onde vai o dinheiro da compra?",
    a: "Quando a compra é feita através do link de um comunicador participante da rede, 90% do valor líquido vai direto para ele. Os 10% restantes são destinados à manutenção e ao desenvolvimento do projeto.",
  },
  {
    q: "O que é a Rede de Comunicadores pelo Pix Cidadão?",
    a: "Uma rede de criadores de conteúdo independentes que usam seus próprios canais para divulgar o e-book e gerar renda com isso, ao mesmo tempo em que ajudam a colocar a proposta em debate público. Veja a seção \"Rede de Comunicadores\" acima para participar.",
  },
  {
    q: "O Pix Cidadão já é uma política pública implementada?",
    a: "Não. É uma proposta de adendo a uma lei que já existe (Lei 10.835/2004). O objetivo deste material é contribuir para o debate público e estimular a discussão sobre novas formas de distribuição de renda e desenvolvimento econômico.",
  },
  {
    q: "Como recebo o e-book depois de pagar?",
    a: "Assim que o Pix é confirmado — geralmente em poucos segundos — a página libera automaticamente um link de download do PDF, sem precisar de mais nenhuma etapa.",
  },
  {
    q: "Por que preciso informar meu e-mail?",
    a: "Usamos seu e-mail só para viabilizar o pagamento via Pix e para garantir que você consiga recuperar o link do e-book caso precise de suporte. Veja mais na nossa Política de Privacidade.",
  },
  {
    q: "Posso compartilhar o e-book gratuitamente?",
    a: "Pode compartilhar trechos, ideias e referências do material para fins de divulgação e debate — mas o arquivo em si é de uso pessoal de quem compra. Se quiser apoiar ainda mais, compartilhe o link de compra.",
  },
];

interface LegalSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  footer?: string;
}

export const legal: {
  updatedAt: string;
  privacy: { intro: string; sections: LegalSection[] };
  terms: { sections: LegalSection[] };
} = {
  updatedAt: "agosto de 2026",
  privacy: {
    intro:
      "A privacidade das pessoas que utilizam o site do Pix Cidadão é importante para nós. Esta Política de Privacidade explica quais informações podem ser coletadas através do site, por que são utilizadas e como são protegidas, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).",
    sections: [
      {
        title: "1. Quais dados podemos coletar",
        paragraphs: [
          "Dependendo de como você usa o site, podemos coletar:",
        ],
        bullets: [
          "nome;",
          "endereço de e-mail;",
          "informações necessárias para identificação da compra;",
          "informações relacionadas à transação Pix (valor, data/hora, identificador do pagamento);",
          "dados de participação na Rede de Comunicadores (nome, e-mail, redes sociais e, se você optar por informar, chave Pix para recebimento de comissões futuras);",
          "informações técnicas básicas de acesso ao site;",
          "informações relacionadas ao link de indicação (código de referência) utilizado na compra.",
        ],
        footer:
          "Não solicitamos dados pessoais além daqueles necessários para o funcionamento do serviço e a gestão do projeto.",
      },
      {
        title: "2. Para que utilizamos esses dados",
        paragraphs: ["Os dados podem ser utilizados para:"],
        bullets: [
          "processar e identificar compras;",
          "disponibilizar o e-book adquirido;",
          "identificar o comunicador responsável pela indicação;",
          "calcular e registrar as vendas e comissões da Rede de Comunicadores;",
          "entrar em contato com compradores ou participantes quando necessário;",
          "melhorar o funcionamento do site;",
          "cumprir obrigações legais.",
        ],
      },
      {
        title: "3. Base legal para o tratamento",
        paragraphs: [
          "Tratamos seus dados com base na execução de contrato (para viabilizar a compra e entrega do e-book), no legítimo interesse (para gestão da Rede de Comunicadores e melhoria do serviço) e, quando aplicável, no cumprimento de obrigação legal ou regulatória.",
        ],
      },
      {
        title: "4. Compartilhamento de dados",
        paragraphs: [
          "Não vendemos dados pessoais dos usuários. Quando necessário para o funcionamento do serviço, determinados dados podem ser processados por empresas que prestam serviços de hospedagem, armazenamento, processamento de pagamento (Mercado Pago) ou outras funções técnicas necessárias à plataforma. Essas empresas devem utilizar os dados de acordo com suas próprias políticas de privacidade e apenas para as finalidades necessárias à prestação do serviço.",
        ],
      },
      {
        title: "5. Por quanto tempo guardamos os dados",
        paragraphs: [
          "Mantemos os dados de transação e de participação na Rede de Comunicadores pelo tempo necessário ao cumprimento das finalidades descritas nesta política, incluindo obrigações fiscais e contábeis, podendo ser mantidos por período adicional quando exigido por lei.",
        ],
      },
      {
        title: "6. Segurança",
        paragraphs: [
          "Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados pessoais contra acessos não autorizados, perda, alteração ou divulgação indevida — entre elas, conexão criptografada (HTTPS), acesso restrito às informações de pagamento e nunca armazenamos dados de cartão (o pagamento é feito exclusivamente via Pix, processado pelo Mercado Pago). Nenhum sistema conectado à internet, entretanto, é completamente livre de riscos.",
        ],
      },
      {
        title: "7. Seus direitos como titular",
        paragraphs: [
          "Nos termos da LGPD, você pode solicitar, a qualquer momento e mediante contato pelo canal indicado no rodapé do site: confirmação da existência de tratamento; acesso aos seus dados; correção de dados incompletos, inexatos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários; portabilidade dos dados; e informações sobre com quem seus dados são compartilhados.",
        ],
      },
      {
        title: "8. Cookies",
        paragraphs: [
          "O site pode utilizar cookies e tecnologias semelhantes estritamente necessários para funcionamento, segurança e reconhecimento do código de indicação de um comunicador. Não utilizamos cookies de publicidade de terceiros.",
        ],
      },
      {
        title: "9. Alterações",
        paragraphs: [
          "Esta Política de Privacidade pode ser atualizada sempre que necessário para refletir mudanças no site, nos serviços utilizados ou na legislação aplicável. A data da última atualização está indicada no topo desta página.",
        ],
      },
      {
        title: "10. Contato",
        paragraphs: [
          "Para dúvidas ou solicitações relacionadas à privacidade e ao tratamento de dados pessoais, entre em contato pelo canal informado na página de Contato.",
        ],
      },
    ],
  },
  terms: {
    sections: [
      {
        title: "O produto",
        paragraphs: [
          `O Pix Cidadão é um e-book digital em formato PDF, vendido por ${site.priceLabel}, com pagamento único via Pix. O acesso é liberado automaticamente após a confirmação do pagamento.`,
        ],
      },
      {
        title: "Entrega",
        paragraphs: [
          "O link de download é pessoal, temporário e gerado apenas após a confirmação do Pix. Guarde o arquivo em local seguro após o download — o link pode expirar.",
        ],
      },
      {
        title: "Reembolso",
        paragraphs: [
          "Por se tratar de um produto digital de baixo valor com entrega imediata, o reembolso é avaliado caso a caso mediante contato pelo canal informado na página de Contato.",
        ],
      },
      {
        title: "Rede de Comunicadores",
        paragraphs: [
          "Comunicadores participantes recebem um link individual de indicação. Quando uma venda é originada por esse link, 90% do valor líquido da venda é destinado ao comunicador, conforme cadastro aprovado. O repasse é feito conforme as regras operacionais divulgadas aos participantes no momento da aprovação.",
          "A participação na rede está sujeita a aprovação e pode ser encerrada a qualquer momento, por qualquer uma das partes, sem prejuízo das comissões já devidas sobre vendas confirmadas.",
        ],
      },
      {
        title: "Uso do conteúdo",
        paragraphs: [
          "O conteúdo do e-book é de uso pessoal do comprador, não podendo ser redistribuído ou revendido sem autorização. Trechos, ideias e referências podem ser compartilhados para fins de divulgação e debate.",
        ],
      },
    ],
  },
};

export const contact = {
  email: "pix.cidadao@gmail.com",
  instagram: "@pix.cidadao",
};

export const footer = {
  text: "Conteúdo independente sobre cidadania, comunicação e participação.",
  credit: {
    text: "Feito por",
    label: "@rocholab",
    href: "https://rocholab.com",
  },
};
