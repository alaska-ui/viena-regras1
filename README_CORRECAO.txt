VIENA — CORREÇÃO SUBCATEGORIAS

CORRIGIDO NESTA VERSÃO:
- Barra PESQUISAR restaurada e sempre visível.
- Cursor personalizado restaurado usando a imagem configurada no site.json/Admin.
- Rastro do cursor restaurado.
- Categorias voltam a abrir normalmente ao clicar no nome.
- A seta ao lado da categoria abre/fecha as subcategorias.
- Clique em uma subcategoria abre a categoria e rola até a seção correspondente.
- Categorias antigas com apenas "rules" continuam compatíveis.
- Categorias novas podem usar "subcategories" sem apagar regras antigas.
- Pesquisa encontra regras diretas e regras dentro de subcategorias.

COMO ATUALIZAR:
1. NÃO apague content/site.json nem content/rules.json.
2. NÃO apague a pasta uploads.
3. Substitua na raiz do GitHub: index.html, app.js e style.css.
4. Substitua admin/config.yml pelo config.yml deste pacote (se seu config fica em admin/config.yml).
5. Para o editor visual, use editor.html ou admin-editor.html conforme o nome que você já usa.
6. Aguarde o GitHub Pages terminar o deploy e faça Ctrl+F5.

IMPORTANTE:
Este pacote NÃO inclui site.json nem rules.json. Portanto não sobrescreve as regras/conteúdo que você já fez no Sveltia.
