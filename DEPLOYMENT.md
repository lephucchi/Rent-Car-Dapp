# Car Rental DApp Deployment Guide

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended for Development)

#### Prerequisites
- Docker and Docker Compose installed
- MetaMask browser extension

#### Steps
1. **Clone and Setup**
```bash
git clone <repository-url>
cd car-rental-dapp
```

2. **Start Services**
```bash
# Start all services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

3. **Deploy Smart Contract**
```bash
cd smartcontract
npm install
npm run node     # Terminal 1: Start Hardhat network
npm run deploy:local  # Terminal 2: Deploy contract
```

4. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Manual Development Setup

#### Backend Setup
```bash
cd backend-fastapi

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start PostgreSQL (if not using Docker)
# Update DATABASE_URL in .env accordingly

# Run backend
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env: VITE_API_BASE_URL=http://localhost:8000/api

# Start frontend
npm run dev
```

#### Smart Contract Setup
```bash
cd smartcontract

# Install dependencies
npm install

# Start local blockchain
npm run node

# Deploy contract (new terminal)
npm run deploy:local
```

## 🌐 Production Deployment

### Cloud Deployment (AWS/Azure/GCP)

#### 1. Prepare Production Environment
```bash
# Create production environment file
cp backend-fastapi/.env.example backend-fastapi/.env.prod

# Update production values:
# - DATABASE_URL (managed PostgreSQL)
# - JWT_SECRET_KEY (strong secret)
# - WEB3_PROVIDER_URL (Infura/Alchemy)
# - ALLOWED_ORIGINS (production domain)
```

#### 2. Build Production Images
```bash
# Build optimized images
docker-compose -f docker-compose.prod.yml build

# Push to container registry
docker tag car-rental-backend:latest your-registry/car-rental-backend:latest
docker push your-registry/car-rental-backend:latest
```

#### 3. Deploy to Cloud
```bash
# Example: Deploy to AWS ECS, Azure Container Instances, or GCP Cloud Run
# Configure your cloud provider's container service
# Set environment variables
# Configure load balancer and SSL certificate
```

### Kubernetes Deployment

#### 1. Create Kubernetes Manifests
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: car-rental

---
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: car-rental
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/car-rental-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
```

#### 2. Deploy to Kubernetes
```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n car-rental

# View logs
kubectl logs -f deployment/backend -n car-rental
```

## 🔧 Environment Configuration

### Backend Environment Variables
```bash
# Required
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
JWT_SECRET_KEY=your-super-secret-key
WEB3_PROVIDER_URL=http://localhost:8545

# Optional
JWT_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
```

### Frontend Environment Variables
```bash
# Required
VITE_API_BASE_URL=http://localhost:8000/api

# Optional
VITE_NODE_ENV=production
```

## 🔒 Security Configuration

### SSL/HTTPS Setup
```bash
# Using Let's Encrypt with Nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Security
```bash
# PostgreSQL security settings
# In postgresql.conf:
ssl = on
password_encryption = scram-sha-256

# Create secure database user
CREATE USER car_rental_app WITH PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE car_rental TO car_rental_app;
GRANT USAGE ON SCHEMA public TO car_rental_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO car_rental_app;
```

## 📊 Monitoring & Logging

### Application Monitoring
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

### Log Aggregation
```bash
# Using ELK Stack
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  elasticsearch:7.14.0

docker run -d \
  --name kibana \
  -p 5601:5601 \
  --link elasticsearch:elasticsearch \
  kibana:7.14.0
```

## 🧪 Testing in Production

### Health Checks
```bash
# Backend health check
curl http://your-domain.com/health

# Database connectivity
curl http://your-domain.com/api/v1/admin/stats

# Smart contract connectivity
curl http://your-domain.com/api/contract/status
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://your-domain.com/api/v1/auth/me

# Using Artillery
npm install -g artillery
artillery quick --count 100 --num 10 http://your-domain.com/api/health
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy Car Rental DApp

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test Backend
        run: |
          cd backend-fastapi
          pip install -r requirements.txt
          python test_auth.py
      
      - name: Test Smart Contracts
        run: |
          cd smartcontract
          npm install
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          # Your deployment commands here
          echo "Deploying to production..."
```

## 📱 Mobile Deployment (Future)

### React Native Setup
```bash
# Initialize React Native project
npx react-native init CarRentalMobile
cd CarRentalMobile

# Install Web3 dependencies
npm install @walletconnect/react-native
npm install react-native-crypto
```

## 🆘 Troubleshooting

### Common Deployment Issues

**Docker Issues:**
```bash
# Clean Docker environment
docker-compose down -v
docker system prune -a
docker-compose up --build
```

**Database Connection:**
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test database connection
docker-compose exec postgres psql -U postgres -d car_rental -c "SELECT 1;"
```

**Smart Contract Issues:**
```bash
# Reset Hardhat network
cd smartcontract
rm -rf cache artifacts
npm run clean
npm run compile
npm run deploy:local
```

**Frontend Build Issues:**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Performance Optimization

**Backend Optimization:**
```python
# Add to app/main.py
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Database connection pooling
engine = create_async_engine(
    database_url,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True
)
```

**Frontend Optimization:**
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          web3: ['ethers', 'web3']
        }
      }
    }
  }
});
```

## 📞 Support

For deployment support:
- Check logs: `docker-compose logs -f`
- Review documentation: `/docs` endpoint
- Open issue on repository
- Contact development team

---

**Deployment Status: ✅ Production Ready**

The Car Rental DApp is fully containerized and ready for production deployment with comprehensive monitoring, security, and scalability features.