# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install Yarn
RUN apk add --no-cache yarn

# Install any needed packages specified in package.json
RUN yarn install

# Build the TypeScript code
RUN yarn build

# Start the application
CMD ["yarn", "start"]
