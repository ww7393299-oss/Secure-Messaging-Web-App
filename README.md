# SecureMsg — Secure Messaging Web App

**SecureMsg** is a full-stack messaging web application built by **Naresh Yadav**. Users can sign in, send messages, and manage their inbox and sent messages. Message bodies are encrypted before they are stored.

## About the Project

I built SecureMsg to practice full-stack web development and explore authentication, server-side functions, data encryption, and cloud storage. The project combines a responsive user interface with server-side message handling.

## Features

- Sign up and sign in with Clerk
- Send messages to other users
- View inbox and sent messages
- Open and read messages
- Mark received messages as read
- Delete messages from inbox or sent folder
- Encrypt message bodies before storage
- Store messages using private Vercel Blob storage
- Responsive user interface

## Technologies Used

- React
- TypeScript
- TanStack Start
- Vite
- Tailwind CSS
- Clerk
- Vercel Blob

## Run Locally

### Requirements

- Node.js and npm
- A Clerk application
- A Vercel Blob store

### Installation

1. Download or clone this repository.
2. Open the project folder in VS Code.
3. Open the VS Code terminal.
4. Install the project dependencies:

   ```bash
   npm install
   ```

5. Create a `.env.local` file in the project’s root folder and add your own environment variable values:

   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   MESSAGE_ENCRYPTION_KEY=your_64_character_hex_key
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open the local URL shown in the terminal. It is usually:

   ```text
   http://localhost:3000
   ```

## Generate an Encryption Key

`MESSAGE_ENCRYPTION_KEY` must contain 64 hexadecimal characters. In PowerShell, generate one with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add the generated value to `.env.local`. Keep it private and save it securely. If you lose or change this key, previously encrypted messages may no longer be readable.

## Build for Production

Create a production build with:

```bash
npm run build
```

## Deploy to Vercel

1. Import the project into Vercel or deploy it using the Vercel CLI.
2. Connect a Vercel Blob store to the project.
3. Add the required environment variables in your Vercel project’s **Environment Variables** settings.
4. Deploy the project.
5. Open the deployment URL provided by Vercel.

Make sure the Clerk keys, Blob token, and encryption key are configured for the deployment environments you use.

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Connects the browser interface to Clerk authentication |
| `CLERK_SECRET_KEY` | Allows the server to verify Clerk authentication |
| `BLOB_READ_WRITE_TOKEN` | Connects the app to Vercel Blob storage |
| `MESSAGE_ENCRYPTION_KEY` | Encrypts and decrypts message bodies |

**Security:** Never publish secret keys or commit `.env.local` to GitHub.

## Author

**Naresh Yadav**

## License

No license has been specified for this project.