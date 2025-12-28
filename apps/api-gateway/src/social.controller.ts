import { Controller, Get, Post, Body, Inject, Req, Param } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Public } from "nest-keycloak-connect";
import { Observable } from "rxjs";
import { CreateReviewDto } from "./dto/create-review.dto";

@Controller("social")
export class SocialController {
  constructor(@Inject("SOCIAL_SERVICE") private readonly socialClient: ClientProxy) { }

  @Get("hello")
  @Public()
  getHelloFromMicroservice(): Observable<string> {
    const pattern = "hello_social_service";
    const payload = {};

    return this.socialClient.send<string>(pattern, payload);
  }

  @Post("review")
  createReview(@Body() createReviewDto: CreateReviewDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.socialClient.send("create_review", { ...createReviewDto, authorId: userId });
  }

  @Get("reviews/:targetId")
  @Public()
  getReviews(@Param("targetId") targetId: string) {
    return this.socialClient.send("get_reviews", targetId);
  }
}
