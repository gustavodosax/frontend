import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter, Routes } from '@angular/router';
import { LoginComponent } from './app/pages/login/login.component';
import { RastreioComponent } from './app/rastreio/rastreio.component';
import { GerenciamentoComponent } from './app/gerenciamento/gerenciamento.component';
import { AuthGuard } from './app/guards/auth.guard';
import { UsuariosComponent } from './app/usuarios/usuarios.component';
import { VeiculoComponent } from './app/veiculo/veiculo.component';
import { GerenciamentoPedidosComponent } from './app/gerenciamento-pedidos/gerenciamento-pedidos.component';
import { MotoristaPedidosComponent } from './app/motorista-pedidos/motorista-pedidos.component';
import { AlterarSenhaComponent } from './app/pages/alterar-senha/alterar-senha.component';


const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'rastreio', component: RastreioComponent },
  { path: 'login', component: LoginComponent }, 
  { path: 'gerenciamento', component: GerenciamentoComponent, canActivate: [AuthGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard] },
  { path: 'veiculo', component: VeiculoComponent, canActivate: [AuthGuard] },
  { path: 'pedidos', component: GerenciamentoPedidosComponent, canActivate: [AuthGuard] },
  { path: 'motorista/pedidos', component: MotoristaPedidosComponent, canActivate: [AuthGuard] },
  { path: 'alterar-senha', component: AlterarSenhaComponent, canActivate: [AuthGuard] }
];

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideRouter(routes)
  ]
})
  .catch((err) => console.error(err));
