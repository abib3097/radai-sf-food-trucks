FROM node:20-alpine

WORKDIR /app

# Declare build-time args for Vite env vars
# These must be passed at build time since Vite bakes them into the bundle
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_MAPS_API_KEY

# Make them available to the Vite build as environment variables
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

COPY package.json .
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]