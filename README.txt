VIENA RP — ARQUIVOS CORRIGIDOS

Substitua no projeto:
- index.html
- style.css
- app.js
- config.yml

Não apague content/, uploads/ ou logo-viena.png.

Correções:
- imagem da categoria não aparece no Mapa da Rua;
- imagem da categoria continua na capa da própria categoria;
- IDs vazios são gerados automaticamente;
- navegação dos botões foi unificada;
- cursor usa somente a imagem do Admin, sem bolinha;
- rastro virou pincelada de tinta e aparece ao mover o mouse;
- Markdown continua aceitando negrito, listas, títulos e caixas;
- imagem da capa continua como fundo;
- letrinhas continuam caindo.

Depois do commit/push, use Ctrl+F5 para forçar a atualização.

EDITOR VISUAL
Abra /admin-editor.html para usar o editor visual da Viena.
Ele mostra o próprio site em uma prévia real e atualiza enquanto você edita.
O botão Rascunho salva no navegador. Baixar JSON gera site.json e rules.json para enviar pelo Admin/GitHub.


CORREÇÃO DESTA VERSÃO
- A barra/ícone de pesquisa foi restaurada como visível no editor e na prévia.
- O editor continua carregando content/site.json e content/rules.json atuais.
- A prévia usa o mesmo index.html, style.css e app.js incluídos no pacote.
- Alterações só vão para o GitHub quando você clicar em Publicar no site.
- O botão Publicar atualiza somente content/site.json e content/rules.json.
- Não substitua esses arquivos manualmente por versões antigas.
