import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { Video, ResizeMode } from 'expo-av';
import icons from '../../constants/icons';
// import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router';
import { createVideo } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
const Create = () => {
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    video: null,
    thumbnail: null,
    prompt: ''
  })
  const { user } = useGlobalContext()
  const openPicker = async (selectType) => {
    // const result = await DocumentPicker.getDocumentAsync({
    //   type: selectType === 'image'
    //   ? ['image/png', 'image/jpeg', 'image/jpg']
    //   : ['video/mp4', 'video/gif']
    // })
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: selectType === 'image' ? ImagePicker.
      MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      // allowsEditing:true,
      aspect: [4,3],
      quality: 1
    })
    if (!result.canceled){
      if (selectType === 'image') {
        setForm({...form, thumbnail: result.assets[0]})
      }
      if (selectType === 'video') {
        setForm({...form, video: result.assets[0]})
      }
    } else {
      setTimeout(() => {
        Alert.alert('Document picked', JSON.stringify(result, null, 2))
      }, 100)
    }
  }
  const submit = async () => {
      if (!form.title || !form.thumbnail || !form.prompt || !form.video){
        return Alert.alert('Error', 'Please fill in all fields')
      }
      setUploading(true)
      try {
        await createVideo({...form, userId: user.$id})
        Alert.alert('Success', 'Post uploaded successfully')
        router.push('/home')
      } catch (error) {
        Alert.alert('Error', error.message)
      } finally {
        setUploading(false)
        setForm({
          title: '',
          video: null,
          thumbnail: null,
          prompt: ''
        })
      }
  }
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-white text-2xl font-psemibold">Upload Video</Text>
        <FormField 
          title="Video Title"
          value={form.title}
          placeholder="Give your video a catchy title..."
          handleChangeText={(e) => setForm({...form, title: e})}
          otherStyles="mt-10"
        />

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">Upload video</Text>
          <TouchableOpacity onPress={() => openPicker('video')}>
            {form.video ? (
              <Video 
                source={{uri: form.video.uri}} 
                className="w-full h-64 rounded-2xl"
                useNativeControls
                resizeMode={ResizeMode.COVER}
                isLooping
              />
            ): (
              <View className="w-full h-40 bg-black-100 px-4 rounded-2xl justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                  <Image source={icons.upload} className="h-1/2 w-1/2" resizeMode='contain'/>
                </View>
              </View>
            )}
          </TouchableOpacity>

        </View>
        <View className="mt-7 space-y-2">
            <Text className="text-base text-gray-100 font-pmedium">
              Thumbnail Image
            </Text>
            <TouchableOpacity onPress={() => openPicker('image')}>
            {form.thumbnail ? (
              <Image 
                source={{uri: form.thumbnail.uri}}
                className="w-full h-64 rounded-2xl"
                resizeMode='cover'
              />
            ): (
              <View 
              className="w-full h-16 bg-black-100 px-4 
              rounded-2xl justify-center border-2 border-black-200 items-center
              flex-row space-x-2">
                  <Image source={icons.upload} className="h-5 w-5" resizeMode='contain'/>
                  <Text className="text-gray-100 font-pmedium text-sm">Choose a file</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <FormField 
          title="AI Prompt"
          value={form.prompt}
          placeholder="The Prompt you used to create this video"
          handleChangeText={(e) => setForm({...form, prompt: e})}
          otherStyles="mt-7"
        />
        <CustomButton
          title="Submit and Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Create