**VintelliTour**

*This is a Next.js project bootstrapped with create-next-app.*

VintelliTour is a smart tourism platform integrating interactive maps, AI chatbots, and a flexible content management system.

Getting Started
1. Clone the repository

```
git clone https://github.com/minhloc289/VintelliTour
#
cd VintelliTour
```

2. Create a .env file
Add the following environment variables:

```
# MongoDB
MONGODB_URI=mongodb://localhost:27017/Vintellitour

# JWT Secret
JWT_SECRET={key}

# Public API Keys
NEXT_PUBLIC_MAPBOX_API_KEY={key}
CESIUM_API_KEY={key}

# LangGraph AI Agent
GOOGLE_API_KEY={key}
TAVILY_API_KEY={key}
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY={key}
LANGSMITH_PROJECT="VintelliTour"
ASSISTANT_ID=b9923bec-9652-45b1-a8e2-4cc547b1f03d

# Hugging Face (content moderation)
HUGGINGFACE_API_KEY={key}

```

3. Install dependencies
```
npm install --legacy-peer-deps
npx @langchain/langgraph-cli@latest dev
```
4. Setup MongoDB
* Connect to your local MongoDB server.

* Create a new database named: Vintellitour.

5. Create and import collections
You need to create the following collections:

* users

* posts

* admins

* provinces

* locations

6. Import Data
   [Link](https://drive.google.com/drive/folders/1kjDJmBVAdah3ev-EwB4Hn8ht3O70l5Kn?usp=drive_link)
7. Run the development server
```
npm run dev
```




   
