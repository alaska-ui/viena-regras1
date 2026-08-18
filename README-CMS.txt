# VIENA — CÓDIGO DA RUA + PAINEL DE ADMIN

## O que mudou
- Site continua hospedado no GitHub Pages.
- `/admin/` vira um painel visual para editar regras, textos, cores, logo e imagens.
- Imagens podem ser enviadas pelo próprio painel e ficam na pasta `/uploads`.
- Regras ficam em `content/rules.json`.
- Layout e textos do site ficam em `content/site.json`.
- O site carrega tudo automaticamente desses arquivos.

## Como instalar no repositório
Envie TODOS estes arquivos/pastas para a raiz do repositório `alaska-ui/viena-regras1`:
- `index.html`
- `style.css`
- `app.js`
- `content/`
- `admin/`
- `uploads/`

Mantenha o `logo-viena.png` que já existe no repositório.

## Painel
Depois de publicar, abra:
`https://alaska-ui.github.io/viena-regras1/admin/`

O painel usa o GitHub como banco de conteúdo. Na primeira entrada, use o botão de login por token do próprio GitHub e crie um token com acesso de escrita ao conteúdo deste repositório.

## Domínio próprio
Se você possui um domínio, por exemplo `regras.seudominio.com`:
1. GitHub → Settings → Pages.
2. Em Custom domain, coloque o domínio.
3. No provedor do domínio, crie um CNAME apontando o subdomínio para `alaska-ui.github.io`.
4. Aguarde a propagação do DNS e ative HTTPS.

Para domínio raiz (`seudominio.com`), use os registros A do GitHub Pages indicados na documentação oficial.

IMPORTANTE: o domínio precisa ser seu/comprado. O GitHub Pages não cria um `.io` personalizado com o nome da cidade.

## Fluxo para adicionar uma regra
Admin → Regras → Categorias e Regras → escolha a categoria → "Adicionar".
Preencha código, título, texto, tag e, se quiser, uma imagem.
Salvar publica a alteração no GitHub; o Pages atualiza o site.

## Fluxo para alterar o layout
Admin → Site e Layout → Configurações do Site.
Você pode trocar:
- logo
- favicon
- título
- textos
- Discord
- imagem da capa
- cores
- elementos visíveis

O painel não permite quebrar o HTML/CSS por acidente: você edita conteúdo e configurações, não código.
