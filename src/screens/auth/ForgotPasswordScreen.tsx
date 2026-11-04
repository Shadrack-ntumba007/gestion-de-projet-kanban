import React from 'react';
import {Text} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {palette} from '../../constants/theme';
export default function ForgotPasswordScreen(){return <Screen title="Mot de passe oublié" back>
<Text style={{color:palette.mutedDark,lineHeight:24}}>Les comptes de cette démo sont stockés uniquement sur ce téléphone. Sans serveur ni adresse e-mail vérifiée, nous ne pouvons pas envoyer de lien de réinitialisation. N'utilisez pas de mot de passe important pour ce prototype.</Text>
</Screen>;}
