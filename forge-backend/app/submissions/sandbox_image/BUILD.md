# Setting up real code execution

Real sandboxed execution needs an actual Docker daemon. **Render's standard
web/worker services do not give you one** — there's no `/var/run/docker.sock`
and no privileged-container option. This isn't a FORGE limitation, it's how
Render's platform works (and true of most PaaS: Railway, Heroku, Vercel are
all the same). You have three realistic options, cheapest first.

## Option A — a small VPS running only Docker (recommended, ~$6/mo)

Spin up the cheapest Docker-capable box you can get (DigitalOcean droplet,
Hetzner CX22, a Linode Nanode — any of them). This machine's only job is to
run containers; your FastAPI app, Postgres, and Redis all stay on Render
exactly as they are now. The Render **worker** process connects to this
box's Docker daemon over the network.

### 1. On the VPS: enable Docker's remote API over TLS

```bash
# Generate a CA and server/client cert pair — Docker's own guide, condensed:
mkdir -p ~/docker-certs && cd ~/docker-certs

openssl genrsa -aes256 -out ca-key.pem 4096
openssl req -new -x509 -days 3650 -key ca-key.pem -sha256 -out ca.pem

openssl genrsa -out server-key.pem 4096
openssl req -subj "/CN=$(hostname -I | awk '{print $1}')" -sha256 -new -key server-key.pem -out server.csr
echo subjectAltName = IP:$(hostname -I | awk '{print $1}'),IP:127.0.0.1 > extfile.cnf
openssl x509 -req -days 3650 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem \
  -CAcreateserial -out server-cert.pem -extfile extfile.cnf

openssl genrsa -out client-key.pem 4096
openssl req -subj '/CN=client' -new -key client-key.pem -out client.csr
echo extendedKeyUsage = clientAuth > extfile-client.cnf
openssl x509 -req -days 3650 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem \
  -CAcreateserial -out client-cert.pem -extfile extfile-client.cnf
```

Configure `dockerd` to listen with TLS (`/etc/docker/daemon.json`):

```json
{
  "hosts": ["tcp://0.0.0.0:2376", "unix:///var/run/docker.sock"],
  "tls": true,
  "tlsverify": true,
  "tlscacert": "/etc/docker/certs/ca.pem",
  "tlscert": "/etc/docker/certs/server-cert.pem",
  "tlskey": "/etc/docker/certs/server-key.pem"
}
```

Copy `ca.pem`, `server-cert.pem`, `server-key.pem` into `/etc/docker/certs/`,
restart Docker (`sudo systemctl restart docker`), and open port 2376 in the
VPS firewall **only** to Render's outbound IP range (or use a WireGuard
tunnel between Render and the VPS if you want to avoid exposing 2376 to the
internet at all — recommended if you're not confident locking down the
firewall correctly).

### 2. Build and push the sandbox image to the VPS

```bash
docker context create forge-remote --docker "host=tcp://YOUR_VPS_IP:2376,ca=ca.pem,cert=client-cert.pem,key=client-key.pem"
docker --context forge-remote build -t forge-python-sandbox:latest -f app/submissions/sandbox_image/Dockerfile app/submissions/sandbox_image
```

### 3. Point the Render worker at it

In the Render dashboard, on your **worker** service's environment variables:

```
SANDBOX_ENABLED=true
DOCKER_HOST=tcp://YOUR_VPS_IP:2376
DOCKER_TLS_CERT_PATH=/etc/secrets/client-cert.pem
DOCKER_TLS_KEY_PATH=/etc/secrets/client-key.pem
DOCKER_TLS_CA_PATH=/etc/secrets/ca.pem
```

Upload `client-cert.pem`, `client-key.pem`, and `ca.pem` as Render "Secret
Files" (Render mounts these at the path you specify — use `/etc/secrets/...`
to match the env vars above).

## Option B — run the worker itself off Render, on the same Docker VPS

Simpler network-wise (no remote TLS needed — worker and Docker daemon on the
same box, using the local socket), but now you're managing a second compute
environment yourself (systemd service, log shipping, restarts) instead of
Render doing it. Only worth it if Option A's TLS setup feels like too much.

## Option C — a commercial code-execution API

Services like Judge0 (via RapidAPI) or Sphere Engine give you an HTTP API
with no infrastructure to manage, at a per-request cost. If you go this
route, `runners/python_runner.py` is the only file that needs to change —
swap the Docker calls for an HTTP request to whichever API you pick, keeping
the same `LanguageRunner` interface so nothing else in the app needs to know.

## Until you set this up

Leave `SANDBOX_ENABLED=false` (the default). The app keeps working exactly
as it does now — `submissions/sandbox.py` falls back to the heuristic
dev-mode grader, which is honest about not executing anything (see that
file's own docstring).
