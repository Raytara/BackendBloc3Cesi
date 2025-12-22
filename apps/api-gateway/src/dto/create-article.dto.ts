export class CreateArticleDto {
  title: string;
  authorId: string;
  description?: string;
  price: number;
  stock?: number;
  boutiqueId?: string;
  categoryId: string;
  sellerId: string;
}
