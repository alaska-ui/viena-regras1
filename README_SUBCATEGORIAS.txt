VIENA — SUBCATEGORIAS

A estrutura nova é opcional e não apaga as regras antigas.

Exemplo de estrutura no content/rules.json:

{
  "categories": [
    {
      "id": "regras-gerais",
      "code": "01",
      "name": "Regras Gerais",
      "short": "Regras Gerais",
      "desc": "A base de convivência de Viena.",
      "subcategories": [
        {
          "id": "regras-basicas",
          "name": "REGRAS BÁSICAS",
          "icon": "◈",
          "rules": [
            {
              "code": "01.01",
              "title": "POWER GAMING",
              "text": "Texto da regra.",
              "tag": "REGRA"
            }
          ]
        },
        {
          "id": "combate-conflito",
          "name": "COMBATE & CONFLITO",
          "icon": "⚔",
          "rules": []
        }
      ],
      "rules": []
    }
  ],
  "updates": []
}

No editor visual agora existe:
- + Subcategoria
- nome e ID da subcategoria
- ícone
- + Regra dentro da subcategoria
- edição das regras sem precisar mexer no JSON

No site:
- a categoria continua aparecendo normalmente;
- ao abrir a categoria, as subcategorias aparecem no menu lateral;
- cada subcategoria pode ser expandida;
- as regras ficam dentro dela;
- clicar na regra leva diretamente até ela;
- categorias antigas que ainda usam "rules" continuam funcionando.
