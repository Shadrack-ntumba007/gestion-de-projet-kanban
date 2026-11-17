import React, {useState} from 'react';
import {View, Text, Pressable, StyleSheet, Keyboard} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {type ThemePalette} from '../../constants/theme';
import {useAppTheme} from '../../hooks/useAppTheme';

const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const days = ['Lu','Ma','Me','Je','Ve','Sa','Di'];
const pad = (n:number) => String(n).padStart(2,'0');

export function CalendarField({label,value,onChange}:{
 label:string;
 value:string;
 onChange:(value:string)=>void;
}){
 const {palette}=useAppTheme();
 const s=makeThemeStyles_s(palette);

 const [open,setOpen] = useState(false);
 const [cursor,setCursor] = useState(new Date());

 const year = cursor.getFullYear();
 const month = cursor.getMonth();
 const offset = (new Date(year,month,1).getDay()+6)%7;
 const count = new Date(year,month+1,0).getDate();

 const move = (n:number) => setCursor(new Date(year,month+n,1));

 const toggle = () => {
  Keyboard.dismiss();
  if(!open){
   const selected = value ? new Date(value+'T12:00:00') : new Date();
   setCursor(isNaN(selected.getTime()) ? new Date() : selected);
  }
  setOpen(!open);
 };

 const select = (day:number) => {
  onChange(`${year}-${pad(month+1)}-${pad(day)}`);
  setOpen(false);
 };

 return <View style={s.wrapper}>
  <Text style={s.label}>{label}</Text>
  <Pressable style={s.field} onPress={toggle} accessibilityRole="button">
   <Ionicons name="calendar-outline" size={23} color={palette.primary}/>
   <Text style={s.text}>{value ? value.split('-').reverse().join('/') : 'Choisir une date'}</Text>
   <Ionicons name="chevron-down" size={18} color={palette.muted}/>
  </Pressable>
  {open && <View style={s.calendar}>
   <View style={s.header}>
    <Pressable onPress={()=>move(-12)} accessibilityLabel="Année précédente"><Text style={s.arrow}>«</Text></Pressable>
    <Pressable onPress={()=>move(-1)} accessibilityLabel="Mois précédent"><Text style={s.arrow}>‹</Text></Pressable>
    <Text style={s.label}>{months[month]} {year}</Text>
    <Pressable onPress={()=>move(1)} accessibilityLabel="Mois suivant"><Text style={s.arrow}>›</Text></Pressable>
    <Pressable onPress={()=>move(12)} accessibilityLabel="Année suivante"><Text style={s.arrow}>»</Text></Pressable>
   </View>
   <View style={s.grid}>
    {days.map(d=><View key={d} style={s.cell}><Text style={{color:palette.muted}}>{d}</Text></View>)}
    {Array.from({length:offset},(_,i)=><View key={'empty'+i} style={s.cell}/>)}
    {Array.from({length:count},(_,i)=>{
     const day=i+1;
     const active=value===`${year}-${pad(month+1)}-${pad(day)}`;
     return <Pressable key={day} onPress={()=>select(day)} style={[s.cell,active&&s.selected]}>
      <Text style={{color:active?palette.white:palette.ink}}>{day}</Text>
     </Pressable>;
    })}
   </View>
   <Pressable onPress={()=>{onChange('');setOpen(false);}}>
    <Text style={s.clear}>Effacer la date</Text>
   </Pressable>
  </View>}
 </View>;
}

const makeThemeStyles_s=(palette:ThemePalette)=>StyleSheet.create({
 wrapper:{marginBottom:20},
 label:{fontSize:15,fontWeight:'700',color:palette.ink},
 field:{flexDirection:'row',alignItems:'center',gap:12,padding:15,borderWidth:1,borderColor:palette.border,borderRadius:14,marginTop:10,backgroundColor:palette.page},
 text:{flex:1,color:palette.ink,fontSize:16},
 calendar:{marginTop:10,padding:10,borderWidth:1,borderColor:palette.border,borderRadius:14,backgroundColor:palette.page},
 header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},
 arrow:{fontSize:26,color:palette.primary,paddingHorizontal:6},
 grid:{flexDirection:'row',flexWrap:'wrap'},
 cell:{width:'14.2857%',height:40,alignItems:'center',justifyContent:'center'},
 selected:{backgroundColor:palette.primary,borderRadius:12},
 clear:{textAlign:'center',color:palette.primary,fontWeight:'700',padding:12}
});