import { Client, Account, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';
export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.tbl.aora',
    projectId: '66bf1895003813b6a0d0',
    databaseId: '66bf27680037e01dfdf7',
    userCollectionId: '66bf2b38000a6874b071',
    videoCollectionId: '66bf2bf7000553295dc9',
    storageId: '66bf2ea80006c5346b68'
}

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    storageId
} = config;

// Init your React Native SDK
const client = new Client();
const avatars = new Avatars(client)
const databases = new Databases(client)
const storage = new Storage(client)

client
    .setEndpoint(endpoint) // Your Appwrite Endpoint
    .setProject(projectId) // Your project ID
    .setPlatform(platform) // Your application ID or bundle ID.
;

const account = new Account(client);

// Register User
export const createUser = async (email, password, username) =>{
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )
        if (!newAccount) throw Error;
        const avatarUrl = avatars.getInitials(username)

        await signIn(email, password)

        const newUser = await databases.createDocument(
            databaseId,
            userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                password,
                avatar: avatarUrl
            }
        )
        return newUser
    } catch (error){
        console.log(error)
        throw new Error(error)
    }
}

export const signIn = async(email, password) =>{
    try {
        // await account.deleteSession('current')
        const session = await account.createEmailPasswordSession(email, password)
        return session
    } catch (error) {
        throw new Error(error)
    }
}
export const getCurrentUser = async() =>{
    try {
        const currentAccount = await account.get()

        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if (!currentUser) throw Error;
        return currentUser.documents[0]
        // return currentAccount;
    } catch (error) {
        throw new Error(error);  
    }
}
export const getAllPosts = async() => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt')]
        )
        return posts.documents
    } catch (error) {
        throw new Error(error);
        
    }
}
export const getAllLatestPosts = async() => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt', Query.limit(7))]
        )
        return posts.documents
    } catch (error) {
        throw new Error(error);
        
    }
}
export const searchPosts = async(query) => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.search('title', query)]
        )
        return posts.documents
    } catch (error) {
        throw new Error(error);
        
    }
}
export const getUserPosts = async(userId) => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.equal('users', userId),  Query.orderDesc('$createdAt')]
        )
        return posts.documents
    } catch (error) {
        throw new Error(error);
    }
}
export const signOut = async () => {
    try {
       const session = await account.deleteSession('current')
       return session
    } catch (error) {
        throw new Error(error)
    }
}

export const getFilePreview = async (fileId, type) =>{
    let fileUrl;

    
    try {
        if (type === 'video'){
            fileUrl = storage.getFileView(storageId, fileId)
        } else if (type === 'image') {
            fileUrl = storage.getFilePreview(storageId, 
                fileId, 2000, 2000, 'top', 100)
        } else {
            throw new Error("Invalid file type");
            
        }
    } catch (error) {
        throw new Error(error);
    }
    if (!fileUrl) throw Error

    return fileUrl
}
export const uploadFile = async (file, type) =>{
    if (!file) return
    // const {mimeType, ...rest} = file

    const asset = {
        name: file.fileName,
        type: file.mimeType,
        size: file.fileSize,
        uri: file.uri
    }

    try {
        const uploadedFile = await storage.createFile(
            storageId,
            ID.unique(),
            asset
        )
        const fileUrl = await getFilePreview(uploadedFile.$id, type);

        return fileUrl
    } catch (error) {
        throw new Error(error);
    }
}
export const createVideo = async(form) => {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, 'image'),
            uploadFile(form.video, 'video')
        ])

        const newPost = await databases.createDocument(
            databaseId, videoCollectionId, ID.unique(), {
                title: form.title,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                prompt: form.prompt,
                users: form.userId
            }
        )
        return newPost
    } catch (error) {
        throw new Error(error);
        
    }
}
