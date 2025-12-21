export class CreateArticleDto {
  title: string; 
  description: string;
  price: number;
  boutiqueId?: string;
  stock?: number;
  authorId: string;
}
