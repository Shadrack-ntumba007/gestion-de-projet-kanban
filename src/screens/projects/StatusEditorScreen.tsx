import React,{useState} from 'react';
import {RouteProp,useRoute} from '@react-navigation/native';
import {Text,View,Pressable,Alert,StyleSheet} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {Button} from '../../components/ui/Button';
import {Field} from '../../components/ui/Field';
import {palette,statusColors} from '../../constants/theme';
import {useProject} from '../../hooks/useProject';
import {useData} from '../../context/DataContext';
import type {AppStackParamList} from '../../types/navigation';
export default function StatusEditorScreen(){
 const {params}=useRoute<RouteProp<AppStackParamList,'StatusEditor'>>(),{statuses,tasks}=useProject(params.projectId),{createStatus,saveStatus,deleteStatus}=useData();
 const [name,setName]=useState(''),[color,setColor]=useState<string>(statusColors[3]),[editId,setEditId]=useState<string|null>(null);
 const submit=async()=>{try{if(editId)await saveStatus(editId,name,color);else await createStatus(params.projectId,name,color);setName('');setEditId(null);}catch(e){Alert.alert('Erreur',e instanceof Error?e.message:'Erreur.');}};
 return <Screen title={editId?'Modifier un état':'Ajouter un état'} back><Text style={s.desc}>Créez une nouvelle étape pour organiser vos tâches.</Text>
 <Field label="Nom de l’état" value={name} onChangeText={setName} placeholder="En révision"/>
 <Text style={s.label}>Couleur de l’état</Text><View style={s.colors}>{statusColors.map(c=><Pressable key={c} onPress={()=>setColor(c)} style={[s.color,{backgroundColor:c},color===c&&{borderColor:palette.primary,borderWidth:3}]}><Text style={{color:palette.primaryDark,fontSize:20}}>{color===c?'✓':''}</Text></Pressable>)}</View>
 <Surface style={{backgroundColor:palette.subtle}}><Text style={{color:palette.mutedDark}}>Aperçu dans le tableau</Text><Text style={[s.preview,{backgroundColor:color}]}>● {name.trim()||'En révision'}</Text></Surface>
 <Button title={editId?'Enregistrer l’état':'⊕ Créer l’état'} onPress={submit}/>
 <Text style={s.label}>États du projet ({statuses.length})</Text>
 {statuses.map(st=><Surface key={st.id} style={s.statusRow}><View style={[s.dot,{backgroundColor:st.color}]}/><View style={{flex:1}}><Text style={s.statusName}>{st.name}</Text><Text style={{color:palette.muted}}>{tasks.filter(t=>t.statusId===st.id).length} tâche(s)</Text></View>
 <Pressable accessibilityLabel={`Modifier ${st.name}`} onPress={()=>{setName(st.name);setColor(st.color);setEditId(st.id);}}><Text style={s.link}>Modifier</Text></Pressable>
 <Pressable accessibilityLabel={`Supprimer ${st.name}`} onPress={()=>Alert.alert('Supprimer cet état ?', 'Impossible s’il contient des tâches.',[{text:'Annuler'},{text:'Supprimer',style:'destructive',onPress:()=>deleteStatus(st.id).catch(e=>Alert.alert('Action refusée',e instanceof Error?e.message:'Erreur'))}])}><Text style={{color:palette.danger}}>Suppr.</Text></Pressable>
 </Surface>)}<Text style={s.desc}>Le glisser-déposer de réorganisation est visible dans la maquette mais reste à développer.</Text>
 </Screen>;
}
const s=StyleSheet.create({desc:{color:palette.mutedDark,lineHeight:22,marginBottom:18},label:{fontSize:17,fontWeight:'700',marginTop:14,marginBottom:12,color:palette.ink},colors:{flexDirection:'row',flexWrap:'wrap',gap:12,marginBottom:14},color:{height:40,width:40,borderRadius:20,alignItems:'center',justifyContent:'center'},preview:{alignSelf:'flex-end',paddingHorizontal:15,paddingVertical:8,borderRadius:30,marginTop:9,fontWeight:'700',color:palette.ink},statusRow:{flexDirection:'row',alignItems:'center',gap:12},dot:{width:13,height:13,borderRadius:7},statusName:{color:palette.ink,fontSize:16,fontWeight:'700'},link:{color:palette.primaryDark,fontWeight:'600'}});
