import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { VeiculoService, Veiculo } from '../services/veiculo.service';

@Component({
  selector: 'app-veiculo',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './veiculo.component.html',
  styleUrls: ['./veiculo.component.scss']
})
export class VeiculoComponent implements OnInit {
  veiculos: Veiculo[] = [];
  veiculo: Veiculo = this.novoVeiculo(); // Usa o método para iniciar
  successMessage: string = '';
  errorMessage: string = '';
  editando: boolean = false; // Adicionada propriedade para controlar o modo de edição

  constructor(private veiculoService: VeiculoService, private router: Router) {}

  ngOnInit() {
    this.listarVeiculos();
  }

  // Método para retornar um novo objeto Veiculo para limpar o formulário
  novoVeiculo(): Veiculo {
    return { placa: '', modelo: '', cor: '' };
  }

  listarVeiculos() {
    this.veiculoService.listar().subscribe({
      next: (dados) => {
        this.veiculos = dados;
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Erro ao carregar veículos:', error);
        this.errorMessage = 'Erro ao carregar veículos.';
      }
    });
  }

  // Método unificado para criar ou atualizar
  criarOuAtualizarVeiculo() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.veiculo.placa || !this.veiculo.modelo || !this.veiculo.cor) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    if (this.editando && this.veiculo.id) {
      this.veiculoService.atualizar(this.veiculo.id, this.veiculo).subscribe({
        next: () => {
          this.successMessage = 'Veículo atualizado com sucesso!';
          this.errorMessage = '';
          this.cancelarEdicao(); // Sai do modo de edição e limpa o formulário
          this.listarVeiculos(); // Recarrega a lista
        },
        error: (error) => {
          this.errorMessage = 'Erro ao atualizar veículo: ' + (error.error?.message || error.message);
          console.error('Erro ao atualizar veículo:', error);
          this.successMessage = '';
        }
      });
    } else {
      this.veiculoService.criar(this.veiculo).subscribe({
        next: () => {
          this.successMessage = 'Veículo criado com sucesso!';
          this.errorMessage = '';
          this.veiculo = this.novoVeiculo(); // Limpa o formulário
          this.listarVeiculos(); // Recarrega a lista
        },
        error: (error) => {
          this.errorMessage = 'Erro ao criar veículo: ' + (error.error?.message || error.message);
          console.error('Erro ao criar veículo:', error);
          this.successMessage = '';
        }
      });
    }
  }

  // Método para carregar um veículo para edição
  editarVeiculo(veiculo: Veiculo) {
    this.veiculo = { ...veiculo }; // Cria uma cópia para evitar modificar diretamente o objeto da lista
    this.editando = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Método para remover um veículo
  removerVeiculo(veiculo: Veiculo) {
    if (veiculo.id && confirm('Deseja realmente remover este veículo?')) {
      this.veiculoService.remover(veiculo.id).subscribe({
        next: () => {
          this.successMessage = 'Veículo removido com sucesso!';
          this.errorMessage = '';
          this.listarVeiculos(); // Recarrega a lista
        },
        error: (error) => {
          this.errorMessage = 'Erro ao remover veículo: ' + (error.error?.message || error.message);
          console.error('Erro ao remover veículo:', error);
          this.successMessage = '';
        }
      });
    }
  }

  // Método para cancelar a edição e limpar o formulário
  cancelarEdicao() {
    this.veiculo = this.novoVeiculo();
    this.editando = false;
    this.successMessage = '';
    this.errorMessage = '';
  }
}
