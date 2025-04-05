# SkillHub: Educational Platform README

SkillHub est une plateforme web collaborative développée avec la stack MERN (MongoDB, Express.js, React.js, Node.js) qui met en relation des formateurs et des apprenants dans divers domaines de compétences.

## Introduction

SkillHub is built as a microservices project using the MERN (MongoDB, Express.js, React.js, Node.js) stack along with Bootstrap and antd for front-end design, and Firebase for file handling. It employs a distributed systems architecture with separate backend servers for Admin, Instructor, and Learner functionalities. Authentication is handled using JSON Web Tokens (JWT) with bcrypt encryption.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

1. **Web/Mobile Interface:** A user-friendly interface allows learners to browse, enroll in, and access courses seamlessly across various devices.

2. **Course Management Service:** Instructors can add, update, and delete course information, manage course content (lecture notes, videos, quizzes), and monitor learner progress. Admins approve course content, integrate payment gateways, and handle financial transactions related to course enrollments.

3. **Learner Service:** Learners can enroll in courses, track their progress, and cancel course enrollment if needed.

4. **Multiple Course Enrollment:** Learners can enroll in multiple courses simultaneously without scheduling conflicts.

5. **Payment Integration:** Integration of payment gateways facilitates course enrollment payments. External third-party services such as Payhere are utilized in a sandbox environment for secure transactions.

## Technologies Used

- **Frontend:** React.js, Bootstrap, antd
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **File Handling:** Firebase
- **Authentication:** JSON Web Tokens (JWT), bcrypt

## Project Structure

