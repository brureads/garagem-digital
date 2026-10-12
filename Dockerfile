
# Garagem Digital - Bootcamp II
# Versao 1.1

FROM nginx:alpine

# Copia os arquivos do site
COPY index.html style.css script.js /usr/share/nginx/html/

# Configuracao do Nginx com cabecalhos de seguranca
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Porta utilizada pelo servidor
EXPOSE 80
