# Reproduce issue while sending a sponsored tx using a AGW session key

## Setup

1. Set `NEXT_PUBLIC_ZYFI_API_KEY` in your .env

2. Install deps

```bash
pnpm i
```

3. Run app

```bash
pnpm dev
```

4. Follow the app steps
    1. Login with abstract
    2. Create a session key (require some funds on abstract testnet)
    3. Send a sponsored tx with the session key