import React,{useCallback,useState} from 'react';
import {Alert,Image,Pressable,Text,View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {File,Paths} from 'expo-file-system';
import {Avatar} from './Avatar';
import {useAppTheme} from '../../hooks/useAppTheme';

export function ProfilePhoto({accountKey,name,size=86}:{
 accountKey:string;
 name:string;
 size?:number;
}){
 const {palette}=useAppTheme();
 const [photo,setPhoto]=useState<string|null>(null);
 const [busy,setBusy]=useState(false);
 const key='@taskify/avatar/'+accountKey;

 useFocusEffect(useCallback(()=>{
  let active=true;
  AsyncStorage.getItem(key).then(filename=>{
   if(!active)return;
   const file=filename?new File(Paths.document,filename):null;
   setPhoto(file?.exists?file.uri:null);
  }).catch(()=>{});
  return ()=>{active=false;};
 },[key]));

 const deleteFile=(filename:string|null)=>{
  if(!filename||!/^taskify-avatar-[a-z0-9-]+\.[a-z0-9]+$/i.test(filename))return;
  try{
   const file=new File(Paths.document,filename);
   if(file.exists)file.delete();
  }catch{}
 };

 const choosePhoto=async(camera:boolean)=>{
  if(busy||!accountKey)return;
  setBusy(true);
  try{
   if(camera){
    const permission=await ImagePicker.requestCameraPermissionsAsync();
    if(!permission.granted){
     Alert.alert('Permission requise','Autorisez la caméra pour prendre une photo.');
     return;
    }
   }

   const options:ImagePicker.ImagePickerOptions={
    mediaTypes:['images'],
    allowsEditing:true,
    aspect:[1,1],
    quality:0.7
   };

   const result=camera
    ?await ImagePicker.launchCameraAsync(options)
    :await ImagePicker.launchImageLibraryAsync(options);

   if(result.canceled)return;

   const source=new File(result.assets[0].uri);
   const extension=/^\.[a-z0-9]+$/i.test(source.extension)?source.extension:'.jpg';
   const filename='taskify-avatar-'+Date.now()+'-'+Math.random().toString(36).slice(2)+extension;
   const destination=new File(Paths.document,filename);
   const old=await AsyncStorage.getItem(key);

   await source.copy(destination);

   try{
    await AsyncStorage.setItem(key,filename);
   }catch(e){
    deleteFile(filename);
    throw e;
   }

   setPhoto(destination.uri);
   deleteFile(old);
  }catch{
   Alert.alert('Erreur','Impossible d’enregistrer la photo.');
  }finally{
   setBusy(false);
  }
 };

 const removePhoto=async()=>{
  if(busy)return;
  setBusy(true);
  try{
   const old=await AsyncStorage.getItem(key);
   await AsyncStorage.removeItem(key);
   setPhoto(null);
   deleteFile(old);
  }catch{
   Alert.alert('Erreur','Impossible de retirer la photo.');
  }finally{
   setBusy(false);
  }
 };

 const openMenu=()=>{
  if(busy||!accountKey)return;
  Alert.alert('Photo de profil','Choisissez une option',[
   {text:'Annuler',style:'cancel'},
   {text:'Galerie',onPress:()=>choosePhoto(false)},
   {text:'Caméra',onPress:()=>choosePhoto(true)}
  ]);
 };

 return <View style={{alignItems:'center',gap:8}}>
  <Pressable onPress={openMenu} disabled={busy||!accountKey}
   accessibilityRole="button" accessibilityLabel="Modifier la photo de profil">
   {photo?<Image source={{uri:photo}} style={{
    width:size,height:size,borderRadius:size/2
   }}/>:<Avatar name={name} size={size}/>}
   <View style={{
    position:'absolute',bottom:0,right:0,
    backgroundColor:palette.primary,borderRadius:18,
    width:32,height:32,alignItems:'center',
    justifyContent:'center',borderWidth:2,borderColor:palette.surface
   }}>
    <Ionicons name="camera" size={17} color={palette.white}/>
   </View>
  </Pressable>
  {photo&&<Pressable disabled={busy} onPress={()=>
   Alert.alert('Retirer la photo ?','Votre avatar par défaut sera rétabli.',[
    {text:'Annuler',style:'cancel'},
    {text:'Retirer',style:'destructive',onPress:()=>removePhoto()}
   ])
  }>
   <Text style={{color:palette.danger,fontSize:12}}>Retirer</Text>
  </Pressable>}
 </View>;
}