import React,{useState} from 'react';
import {Alert,KeyboardAvoidingView,Platform,ScrollView,Text,View,StyleSheet,Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {palette} from '../../constants/theme';
import {Button} from '../../components/ui/Button';
import {Field} from '../../components/ui/Field';
import {useAuth} from '../../context/AuthContext';
import {useAuthNavigation} from '../../hooks/useAppNavigation';
import {DEMO_EMAIL,DEMO_PASSWORD} from '../../db/repositories/localAccountRepository';
export default function LoginScreen(){
 const nav=useAuthNavigation(),{login,enterDemo}=useAuth();
 const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false);
 const submit=async()=>{if(busy)return;setBusy(true);try{await login(email,password);}catch(e){Alert.alert('Connexion impossible',e instanceof Error?e.message:'Erreur');}finally{setBusy(false);}};
 return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
 <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><View style={s.logo}><Ionicons name="checkmark-done" color={palette.white} size={42}/></View>
 <Text style={s.brand}>Taskify</Text><Text style={s.title}>Bon retour 👋</Text><Text style={s.desc}>Connectez-vous pour retrouver vos projets.</Text>
 <Field label="Email" value={email} onChangeText={setEmail} placeholder="votre.email@exemple.com" keyboardType="email-address"/>
 <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry/>
 <Pressable onPress={()=>nav.navigate('ForgotPassword')}><Text style={s.linkRight}>Mot de passe oublié ?</Text></Pressable>
 <Button title="Se connecter →" loading={busy} disabled={busy} onPress={submit}/>
 <Text style={s.info}>Comptes locaux à cet appareil uniquement. Aucun serveur distant.</Text>
 <Button title="Explorer la démo locale" variant="soft" onPress={()=>{enterDemo().catch(()=>Alert.alert('Erreur','Impossible d’ouvrir la démo.'));}}/>
 <Text style={s.info}>Compte démo : {DEMO_EMAIL} / {DEMO_PASSWORD}</Text>
 <Pressable onPress={()=>nav.navigate('SignUp')}><Text style={s.bottom}>Pas encore de compte ? <Text style={s.link}>Créer un compte</Text></Text></Pressable>
 </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:palette.page},content:{flexGrow:1,justifyContent:'center',padding:28,paddingVertical:60},logo:{width:88,height:88,borderRadius:27,backgroundColor:palette.primary,alignSelf:'center',alignItems:'center',justifyContent:'center'},brand:{fontSize:26,fontWeight:'800',textAlign:'center',marginTop:15,color:palette.ink},title:{fontSize:34,textAlign:'center',fontWeight:'800',color:palette.ink,marginTop:38},desc:{fontSize:17,textAlign:'center',color:palette.mutedDark,marginBottom:42,marginTop:10,lineHeight:25},linkRight:{textAlign:'right',color:palette.primaryDark,fontWeight:'700',marginBottom:24},info:{textAlign:'center',color:palette.muted,marginVertical:12,fontSize:12},bottom:{textAlign:'center',marginTop:26,fontSize:15,color:palette.mutedDark},link:{color:palette.primary,fontWeight:'700'}});
