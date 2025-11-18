import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../services/usuario.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  standalone: true,  
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuario: Usuario = this.novoUsuario();
  mensagem = '';
  erro = '';
  editando = false;

  constructor(private usuarioService: UsuarioService) {}
  

  ngOnInit() {
    this.listarUsuarios();
  }

  novoUsuario(): Usuario {
    return { nomeCompleto: '', matricula: '', perfil: 'Motorista', senha: '', trocarSenhaPrimeiroLogin: true };
  }

  listarUsuarios() {
    this.usuarioService.listar().subscribe({
      next: (dados) => {
        this.usuarios = dados;
        this.erro = '';
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.erro = 'Erro ao carregar usuários.';
      }
    });
  }

  criarOuAtualizarUsuario() {
    if (!this.usuario.nomeCompleto || !this.usuario.matricula || !this.usuario.perfil || !this.usuario.senha) {
      this.erro = 'Preencha todos os campos.';
      this.mensagem = '';
      return;
    }

    if (this.editando && this.usuario.id) {
      this.usuarioService.atualizar(this.usuario.id, this.usuario).subscribe({
        next: () => {
          this.mensagem = 'Usuário atualizado com sucesso!';
          this.erro = '';
          this.cancelarEdicao();
          this.listarUsuarios();
        },
        error: (error) => {
          console.error('Erro ao atualizar usuário:', error);
          this.erro = 'Erro ao atualizar usuário.';
          this.mensagem = '';
        }
      });
    } else {
      this.usuarioService.criar(this.usuario).subscribe({
        next: () => {
          this.mensagem = 'Usuário criado com sucesso!';
          this.erro = '';
          this.usuario = this.novoUsuario();
          this.listarUsuarios();
        },
        error: (error) => {
          console.error('Erro ao criar usuário:', error);
          this.erro = 'Erro ao criar usuário.';
          this.mensagem = '';
        }
      });
    }
  }

  editarUsuario(usuario: Usuario) {
    this.usuario = { ...usuario };
    this.editando = true;
    this.mensagem = '';
    this.erro = '';
  }

  removerUsuario(usuario: Usuario) {
    if (usuario.id && confirm('Deseja remover este usuário?')) {
      this.usuarioService.remover(usuario.id).subscribe({
        next: () => {
          this.mensagem = 'Usuário removido com sucesso!';
          this.erro = '';
          this.listarUsuarios();
        },
        error: (error) => {
          console.error('Erro ao remover usuário:', error);
          this.erro = 'Erro ao remover usuário.';
          this.mensagem = '';
        }
      });
    }
  }

  cancelarEdicao() {
    this.usuario = this.novoUsuario();
    this.editando = false;
    this.mensagem = '';
    this.erro = '';
  }
}
