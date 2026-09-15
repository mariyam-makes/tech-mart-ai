# 🤖 Alexa — TechMart AI E-commerce Support Agent

Alexa is an AI-powered customer support agent for **TechMart Online Store**.

The system helps customers with product questions, order support, return/refund requests, company policies, and automated refund confirmation emails.

---

## 📌 Project Overview

TechMart Alexa combines AI, Retrieval-Augmented Generation (RAG), product/order data, automated email, and Google Sheets logging into one customer support system.

### Main capabilities

- 💬 AI customer support chatbot
- 🛍️ Product search and product information
- 📦 Order lookup and order status
- 📋 Company policy search using RAG
- 💰 Return/refund eligibility checking
- 📧 Automated refund confirmation emails
- 📊 Customer interaction and refund logging
- 🔐 Secure environment-variable configuration
- 🌐 Next.js/Vercel deployment support

---

## 🏗️ System Architecture

```text
                         CUSTOMER
                            │
                            ▼
                     ┌─────────────┐
                     │   Alexa AI  │
                     │   Chatbot   │
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        Product Data    Order Data    Policy RAG
              │             │             │
              ▼             ▼             ▼
        Product Tool    Order Tool    ChromaDB
                                            │
                                            ▼
                                      Policy Document
                                            │
                            ┌───────────────┘
                            ▼
                     Refund Eligibility
                            │
                    ┌───────┴────────┐
                    ▼                ▼
                 Approved         Rejected
                    │                │
                    ▼                ▼
              Gmail Email          No Email
                    │
                    ▼
              Google Sheets
                  Logging
