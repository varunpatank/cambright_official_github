# Dockerfile
FROM node:20-alpine

RUN apk add --no-cache git

# Create app directory
WORKDIR /app

RUN npm i -g pnpm

# Set NODE_ENV
ENV NODE_ENV=production

COPY . .
RUN pnpm install
RUN pnpm run postinstall

# Build app
RUN pnpm run build

# Expose the port Next.js uses
EXPOSE 3000

# Start the app
CMD ["pnpm", "start"]
