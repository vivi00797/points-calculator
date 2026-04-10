# Software Requirements Specification (SRS)

**Project Name**: Points Calculator Tool
**Version**: 1.0
**Date**: 2026-04-09
**Author**: Requirements Analyst AI

---

## 1. Introduction

### 1.1 Purpose
This document defines the software requirements for the "Points Calculator Tool".

### 1.2 Scope
- **In Scope**: A standalone frontend tool for internal operations and external customers to quickly calculate point configurations and estimate Large Language Model (LLM) API costs based on a specific formula.
- **Out of Scope**: Backend integration, user authentication, data persistence.

### 1.3 Definitions and Acronyms
- **Tokens**: The basic unit of data processed by LLMs (e.g., input tokens, output tokens).
- **Points**: The calculated currency or metric used within the system to represent API usage cost.
- **Formula**: `Points = (((Input Tokens / 1000) * Input Price + (Output Tokens / 1000) * Output Price) * Loss Rate * Profit Margin) / Point Coefficient`.

---

## 2. System Overview

### 2.1 System Purpose
To provide a fast, easy-to-use calculator for estimating API costs and converting them into a standardized "Points" metric, primarily serving internal operations and external customers.

### 2.2 Users
- **Internal Operations Staff**: To quickly calculate point configurations. (Estimated: < 100 users)
- **External Customers (End Users/Developers)**: To estimate LLM API costs. (Estimated: < 100 users)

### 2.3 Target Environment
- **Browser**: Modern web browsers (Chrome, Firefox, Safari, Edge).
- **Device**: Desktop, Tablet, Smartphone (Responsive Design).
- **Network**: Internet connection required for initial load; can run purely in the browser thereafter.

---

## 3. Functional Requirements

### 3.1 Model Selection & Pricing Retrieval
- FR-001: The system shall provide a dropdown list of available LLM models.
- FR-002: The system shall allow users to manually type to fuzzy-search for a model name.
- FR-003: Upon selecting a model, the system shall automatically populate the corresponding "Input Price" and "Output Price" fields.
- FR-004: The populated price fields shall be editable by the user.

### 3.2 Parameter Input
- FR-011: The system shall provide input fields for the following parameters: Input Tokens, Output Tokens, Input Price, Output Price, Loss Rate, Profit Margin, and Point Coefficient.
- FR-012: The system shall populate default values for specific fields upon initialization: Loss Rate (20%), Profit Margin (50%), Point Coefficient (0.02).

### 3.3 Real-time Point Calculation
- FR-021: The system shall automatically and in real-time calculate the total "Points" whenever any parameter is entered or modified.
- FR-022: The calculation shall strictly adhere to the formula: `Points = (((Input Tokens / 1000) * Input Price + (Output Tokens / 1000) * Output Price) * Loss Rate * Profit Margin) / Point Coefficient`.
- FR-023: The system shall display the final calculated "Points" clearly on the page.
- FR-024: The system shall optionally display intermediate calculation details for verification purposes.

---

## 4. Non-Functional Requirements

### 4.1 Performance
- NFR-001: The system shall exhibit fast response times, displaying calculation results almost instantaneously (e.g., < 0.5 seconds) upon parameter modification.

### 4.2 Security
- NFR-011: As a pure frontend tool with no backend, no specific security requirements (e.g., authentication, authorization) are mandated.

### 4.3 Availability
- NFR-021: No strict high availability requirements; short periods of downtime are acceptable for this internal tool.

### 4.4 Extensibility
- NFR-031: The codebase shall be designed to easily accommodate future additions of more complex billing formulas and expanded model lists.

---

## 5. External Interfaces

### 5.1 User Interfaces
- A clean, intuitive, and responsive web interface suitable for quick calculations.

### 5.2 Software Interfaces
- None (Standalone frontend application).

---

## 6. System Characteristics

### 6.1 Usability
- The interface must be highly usable and intuitive, allowing users to perform calculations without prior training.

---

## Appendix A: Glossary
- **LLM**: Large Language Model.

## Appendix B: Revision History
| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-04-09 | Initial Draft | Requirements Analyst AI |
