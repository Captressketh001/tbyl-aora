import { Client, Account, ID, Avatars, Databases, Query } from 'react-native-appwrite';
export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.tbl.aora',
    projectId: '66bf1895003813b6a0d0',
    databaseId: '66bf27680037e01dfdf7',
    userCollectionId: '66bf2b38000a6874b071',
    videoCollectionId: '66bf2bf7000553295dc9',
    storageId: '66bf2ea80006c5346b68'
}

// Init your React Native SDK
const client = new Client();
const avatars = new Avatars(client)
const databases = new Databases(client)

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.
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
            config.databaseId,
            config.userCollectionId,
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
        await account.deleteSession('current')
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

        // const currentUser = await databases.listDocuments(
        //     config.databaseId,
        //     config.userCollectionId,
        //     [Query.equal('accountId', currentAccount.$id)]
        // )
        // if (!currentUser) throw Error;
        // return currentUser.documents[0]
        return currentAccount;
    } catch (error) {
        throw new Error(error);  
    }
}