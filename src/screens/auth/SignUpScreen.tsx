import React,{useState} from 'react';
import {Text,ScrollView,StyleSheet,Alert,Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Field} from '../../components/ui/Field';
import {Button} from '../../components/ui/Button';
import {palette} from '../../constants/theme';
import {useAuthNavigation} from '../../hooks/useAppNavigation';
import {useAuth} from '../../context/AuthContext';
import {validEmail,validPassword} from '../../utils/validation';
export default function SignUpScreen(){
 const nav=useAuthNavigation(),{signUp}=useAuth();
 const[name,setName]=useState(''),[email,setEmail]=useState(''),[pass,setPass]=useState(''),[confirm,setConfirm]=useState(''),[accept,setAccept]=useState(false),[busy,setBusy]=useState(false);
 const submit=async()=>{
  if(!name.trim()||!validEmail(email)||!validPassword(pass)||pass!==confirm||!accept){Alert.alert('Formulaire incomplet','Vérifiez le nom, l’email, les 8 caractères minimum, la confirmation et les conditions.');return;}
  setBusy(true);try{await signUp(name,email,pass);}catch(e){Alert.alert('Inscription impossible',e instanceof Error?e.message:'Erreur');}finally{setBusy(false);}
 };
 return <SafeAreaView style={{flex:1,backgroundColor:palette.page}}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><Pressable onPress={()=>nav.goBack()}><Text style={s.link}>‹ Retour</Text></Pressable>
 <Text style={s.logo}>● Taskify</Text><Text style={s.title}>Créer un compte</Text><Text style={s.desc}>Compte local sur ce téléphone pour le projet universitaire.</Text>
 <Field label="Nom complet" value={name} onChangeText={setName} placeholder="Votre nom"/>
 <Field label="Adresse e-mail" value={email} onChangeText={setEmail} placeholder="nom@exemple.com" keyboardType="email-address"/>
 <Field label="Mot de passe (8+ caractères)" value={pass} onChangeText={setPass} secureTextEntry/>
 <Field label="Confirmer le mot de passe" value={confirm} onChangeText={setConfirm} secureTextEntry/>
 <Pressable onPress={()=>setAccept(v=>!v)}><Text style={s.agree}>{accept?'☑':'□'} J’accepte les Conditions Générales et la Politique de Confidentialité (documents de démonstration).</Text></Pressable>
 <Button title="Créer mon compte local →" loading={busy} disabled={busy} onPress={submit}/>
 <Text style={s.muted}>Aucun email n’est envoyé. Le compte n'existe que sur cet appareil ; les données sont conservées dans SQLite.</Text>
 <Pressable onPress={()=>nav.navigate('Terms')}><Text style={s.link}>Conditions générales à préparer</Text></Pressable>
 <Pressable onPress={()=>nav.navigate('Privacy')}><Text style={s.link}>Politique de confidentialité à préparer</Text></Pressable>
 </ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({content:{padding:28,paddingBottom:80},logo:{textAlign:'center',color:palette.primary,fontWeight:'800',marginTop:10},title:{fontSize:34,fontWeight:'800',marginTop:40,color:palette.ink},desc:{fontSize:17,color:palette.mutedDark,lineHeight:26,marginTop:12,marginBottom:30},agree:{color:palette.ink,lineHeight:25,marginBottom:30},muted:{color:palette.muted,fontSize:12,lineHeight:20,marginTop:15},link:{color:palette.primaryDark,fontWeight:'600',marginVertical:8}});
