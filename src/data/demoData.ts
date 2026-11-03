/** Identités et tâches FICTIVES issues des maquettes, uniquement pour une démo locale. */
import type { Project, Task, User, Workspace, KanbanStatus, ProjectMember, TaskAssignee, Subtask, TaskComment, Notification } from '../types/models';
const now=new Date().toISOString();
const inDays=(n:number)=>new Date(Date.now()+n*86_400_000).toISOString();
export const demoWorkspace:Workspace={id:'w-demo',name:'Taskify Studio',ownerId:'u-owner'};
export const demoUsers:User[]=[
{id:'u-owner',name:'Akhsan Muzaki',email:'akhsan@taskify.io'},
{id:'u-marie',name:'Marie T.',email:'marie@example.test'},
{id:'u-fabien',name:'Fabien M.',email:'fabien@example.test'},
{id:'u-sarah',name:'Sarah T.',email:'sarah@example.test'},
{id:'u-lucas',name:'Lucas B.',email:'lucas@example.test'},
];
export const demoProjects:Project[]=[
{id:'p-commerce',workspaceId:'w-demo',title:'Application e-commerce',description:'Développement du parcours d’achat et du tableau de bord.',icon:'💻',priority:'medium',dueDate:inDays(32),createdAt:now,updatedAt:now},
{id:'p-design',workspaceId:'w-demo',title:'Design System Taskify',description:'Bibliothèque de composants et principes graphiques.',icon:'🎨',priority:'medium',dueDate:inDays(42),createdAt:now,updatedAt:now},
{id:'p-site',workspaceId:'w-demo',title:'Refonte Site Web Vitrine',description:'Mise à jour des pages principales du site.',icon:'☀️',priority:'low',dueDate:inDays(62),createdAt:now,updatedAt:now},
{id:'p-rse',workspaceId:'w-demo',title:'Stratégie RSE 2026',description:'Planification des actions et de la communication.',icon:'🌱',priority:'low',dueDate:inDays(94),createdAt:now,updatedAt:now},
];
export const demoStatuses:KanbanStatus[]=[
{id:'s-todo',projectId:'p-commerce',name:'À faire',color:'#D4E9E7',position:0},
{id:'s-progress',projectId:'p-commerce',name:'En cours',color:'#E5DEFF',position:1},
{id:'s-done',projectId:'p-commerce',name:'Terminé',color:'#FFDDDA',position:2},
...['p-design','p-site','p-rse'].flatMap(p=>[
{id:`${p}-todo`,projectId:p,name:'À faire',color:'#D4E9E7',position:0},
{id:`${p}-progress`,projectId:p,name:'En cours',color:'#E5DEFF',position:1},
{id:`${p}-done`,projectId:p,name:'Terminé',color:'#FFDDDA',position:2},
]),
];
export const demoTasks:Task[]=[
{id:'t-checkout',projectId:'p-commerce',statusId:'s-todo',title:'Maquette UI Checkout',description:'Finaliser le responsive mobile et les animations du panier d’achat. Prévoir les états d’erreur et les micro-interactions.',priority:'high',startDate:now,dueDate:inDays(3),createdAt:now,updatedAt:now},
{id:'t-research',projectId:'p-commerce',statusId:'s-todo',title:'Recherche utilisateur',description:'Interviews et synthèses personas auprès du panel B2C.',priority:'low',startDate:null,dueDate:inDays(5),createdAt:now,updatedAt:now},
{id:'t-api',projectId:'p-commerce',statusId:'s-progress',title:'Authentification API',description:'Préparer les contrats d’authentification pour les utilisateurs.',priority:'medium',startDate:now,dueDate:inDays(10),createdAt:now,updatedAt:now},
{id:'t-spec',projectId:'p-commerce',statusId:'s-done',title:'Spécifications initiales',description:'Valider les exigences du MVP.',priority:'low',startDate:null,dueDate:inDays(-1),createdAt:now,updatedAt:now},
{id:'t-tokens',projectId:'p-design',statusId:'p-design-progress',title:'Tokens et composants',description:'Définir les couleurs, typographies et espacements.',priority:'medium',startDate:null,dueDate:inDays(7),createdAt:now,updatedAt:now},
{id:'t-landing',projectId:'p-site',statusId:'p-site-todo',title:'Nouvelle page d’accueil',description:'Concevoir la structure responsive.',priority:'medium',startDate:null,dueDate:inDays(20),createdAt:now,updatedAt:now},
{id:'t-rse',projectId:'p-rse',statusId:'p-rse-todo',title:'Calendrier des initiatives',description:'Préparer la feuille de route du trimestre.',priority:'low',startDate:null,dueDate:inDays(40),createdAt:now,updatedAt:now},
];
export const demoMembers:ProjectMember[]=[
...demoUsers.map((u,i)=>({projectId:'p-commerce',userId:u.id,role:(i===0?'owner':i===1?'admin':i===4?'viewer':'editor') as ProjectMember['role']})),
...['p-design','p-site','p-rse'].flatMap(id=>[
{projectId:id,userId:'u-owner',role:'owner' as const},{projectId:id,userId:'u-marie',role:'editor' as const},
]),
];
export const demoAssignees:TaskAssignee[]=[
{taskId:'t-checkout',userId:'u-marie'},{taskId:'t-checkout',userId:'u-fabien'},
{taskId:'t-research',userId:'u-sarah'},{taskId:'t-api',userId:'u-owner'},
{taskId:'t-tokens',userId:'u-owner'},{taskId:'t-landing',userId:'u-marie'},
];
export const demoSubtasks:Subtask[]=[
{id:'st-1',taskId:'t-checkout',title:'Flux panier multi-étapes',done:true,position:0},
{id:'st-2',taskId:'t-checkout',title:'Composant résumé de commande',done:true,position:1},
{id:'st-3',taskId:'t-checkout',title:'Validation formulaires de paiement',done:false,position:2},
];
export const demoComments:TaskComment[]=[
{id:'c-1',taskId:'t-checkout',authorId:'u-fabien',body:'Les maquettes sont validées. Je commence l’intégration mobile.',createdAt:now},
];
export const demoNotifications:Notification[]=[
{id:'n-1',userId:'u-owner',title:'Tâche à suivre',body:'Authentification API est en cours.',createdAt:now,read:false},
{id:'n-2',userId:'u-owner',title:'Projet mis à jour',body:'Application e-commerce a été modifié.',createdAt:now,read:false},
];
