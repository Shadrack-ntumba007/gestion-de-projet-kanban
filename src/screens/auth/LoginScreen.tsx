import React,{useState} from 'react';
import {Alert,KeyboardAvoidingView,Platform,ScrollView,Text,View,StyleSheet,Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {palette} from '../../constants/theme';
import {Button} from '../../components/ui/Button';
import {Field} from '../../components/ui/Field';
import {useAuth} from '../../context/AuthContext';
import {useAuthNavigation} from '../../hooks/useAppNavigation';
export default function LoginScreen(){
 const nav=useAuthNavigation(),{enterDemo}=useAuth();
 const [email,setEmail]=useState(''),[password,setPassword]=useState('');
 return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
 <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><View style={s.logo}><Ionicons name="checkmark-done" color={palette.white} size={42}/></View>
 <Text style={s.brand}>Taskify</Text><Text style={s.title}>Bon retour 👋</Text><Text style={s.desc}>Connectez-vous pour retrouver vos projets.</Text>
 <Field label="Email" value={email} onChangeText={setEmail} placeholder="votre.email@exemple.com" keyboardType="email-address"/>
 <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry/>
 <Pressable onPress={()=>nav.navigate('ForgotPassword')}><Text style={s.linkRight}>Mot de passe oublié ?</Text></Pressable>
 <Button title="Se connecter →" onPress={()=>Alert.alert('Backend non configuré','La connexion avec identifiants nécessitera une API d’authentification. Utilisez le mode démo pour explorer l’application.')}/>
 <Text style={s.info}>Mode local : aucune connexion distante et aucun compte réel.</Text>
 <Button title="Explorer la démo locale" variant="soft" onPress={()=>{enterDemo().catch(()=>Alert.alert('Erreur','Impossible d’ouvrir la démo.'));}}/>
 <Pressable onPress={()=>nav.navigate('SignUp')}><Text style={s.bottom}>Pas encore de compte ? <Text style={s.link}>Créer un compte</Text></Text></Pressable>
 </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:palette.page},content:{flexGrow:1,justifyContent:'center',padding:28,paddingVertical:60},logo:{width:88,height:88,borderRadius:27,backgroundColor:palette.primary,alignSelf:'center',alignItems:'center',justifyContent:'center'},brand:{fontSize:26,fontWeight:'800',textAlign:'center',marginTop:15,color:palette.ink},title:{fontSize:34,textAlign:'center',fontWeight:'800',color:palette.ink,marginTop:38},desc:{fontSize:17,textAlign:'center',color:palette.mutedDark,marginBottom:42,marginTop:10,lineHeight:25},linkRight:{textAlign:'right',color:palette.primaryDark,fontWeight:'700',marginBottom:24},info:{textAlign:'center',color:palette.muted,marginVertical:12,fontSize:12},bottom:{textAlign:'center',marginTop:26,fontSize:15,color:palette.mutedDark},link:{color:palette.primary,fontWeight:'700'}});
