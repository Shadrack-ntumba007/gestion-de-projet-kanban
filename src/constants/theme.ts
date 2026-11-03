import type { ViewStyle } from 'react-native';
export const palette = {
  primary:'#5956EF', primaryDark:'#403CCA', lilac:'#E5DEFF', mint:'#D4E9E7',
  rose:'#FFDDDA', page:'#FBF8F8', surface:'#FFFFFF', subtle:'#F3F0F0',
  ink:'#171717', muted:'#777388', mutedDark:'#4C495D', border:'#ECE8E8',
  danger:'#B3262F', warning:'#6B5F83', white:'#FFFFFF',
} as const;
export const spacing = { xxs:4, xs:8, sm:12, md:16, lg:24, xl:32 } as const;
export const radius = { sm:12, md:18, lg:26, xl:34, pill:100 } as const;
export const elevation: ViewStyle = {
  shadowColor:'#333052', shadowOffset:{width:0,height:3}, shadowOpacity:0.06, shadowRadius:8, elevation:2,
};
export const priorityMeta = {
  low: { label:'Faible', color:'#D4E9E7', text:'#223C3A' },
  medium: { label:'Moyenne', color:'#615B78', text:'#FFFFFF' },
  high: { label:'Élevée', color:'#FFDDDA', text:'#8C1723' },
} as const;
export const statusColors = ['#D4E9E7','#E5DEFF','#FFDDDA','#5956EF','#E3DFDF','#C8C1FF'] as const;
