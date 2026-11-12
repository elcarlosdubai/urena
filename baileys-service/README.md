# 🤖 Servicio WhatsApp Baileys - Ureña Tax & Accounting

Servicio backend en Node.js diseñado para desplegarse fácilmente en **Namecheap (cPanel -> Setup Node.js App)** o VPS.

---

### 🚀 Despliegue en Namecheap cPanel:
1. Accede a tu **cPanel de Namecheap**.
2. Ve a la sección **"Setup Node.js App"** (Software).
3. Haz clic en **"Create Application"**:
   - **Node.js version:** `18.x` o `20.x` (Recomendado).
   - **Application mode:** `Production`.
   - **Application root:** `baileys-service`.
   - **Application URL:** `baileys.urenatax.com` o la subruta que elijas.
   - **Application startup file:** `server.js`.
4. Sube los archivos de esta carpeta (`package.json`, `server.js`, `.env`).
5. En la misma pantalla de Namecheap, haz clic en **"Run NPM Install"**.
6. Haz clic en **"Restart Application"**.

---

### 📲 Cómo escanear el QR desde el portal:
- El servicio expone el endpoint `GET /status`.
- Si la sesión no está iniciada, devuelve el QR en base64 para que el panel `/admin` lo muestre en vivo.
- Abres WhatsApp en el teléfono oficial de Ureña Tax (`551-232-1994`) -> Dispositivos vinculados -> Escanear código QR.
- Una vez vinculado, el estado cambiará a **"CONECTADO"** y empezará a procesar los mensajes en cola automáticamente.
