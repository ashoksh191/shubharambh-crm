# ⛵ Kubernetes Production Deployment Guide — Shubharambh CRM

This guide provides step-by-step instructions for deploying **Shubharambh CRM** to an enterprise Kubernetes cluster (AWS EKS, Google GKE, Azure AKS, or On-Premises Kubernetes 1.28+).

---

## 🏗️ Architecture Overview

```text
               [ Internet / TLS HTTPS ]
                          │
                   ▼ (Port 443)
           [ Nginx Ingress Controller ]
             /                    \
  /api, /health, /ready, /metrics   / (Frontend SPA)
           │                        │
           ▼                        ▼
 [ Backend Service ]      [ Frontend Service ]
   (3-10 Pods HPA)           (2 Pods)
           │
 ┌─────────┴─────────┐
 ▼                   ▼
[PostgreSQL 16 DB] [Redis 7.2 Cache]
```

---

## ⚡ Deployment Instructions

### 1. Create Production Namespace
```bash
kubectl create namespace shubharambh-production
```

### 2. Apply ConfigMaps & Secrets
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
```

### 3. Deploy Backend Micro-Service Cluster
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/services.yaml
```

### 4. Deploy Frontend Web Nginx Cluster
```bash
kubectl apply -f k8s/frontend-deployment.yaml
```

### 5. Enable Horizontal Pod Autoscaling (HPA) & Ingress Routing
```bash
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## 🔍 Verification & Health Checks

### Check Running Pods & Services
```bash
kubectl get pods,svc,hpa,ingress -n shubharambh-production
```

### Verify Zero-Downtime Rolling Update
```bash
kubectl rollout status deployment/shubharambh-backend -n shubharambh-production
```

### Check Logs
```bash
kubectl logs -f -l app=shubharambh-backend -n shubharambh-production
```
