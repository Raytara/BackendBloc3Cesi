export class CreateReviewDto {
  authorId: string;
  targetId: string;
  rating: number;
  comment?: string;
}
