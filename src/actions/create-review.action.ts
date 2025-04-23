"use server";

import { revalidatePath } from "next/cache";

export async function createReviewAction(formData: FormData) {
  const bookId = formData.get("bookId")?.toString();
  const content = formData.get("content")?.toString();
  const author = formData.get("author")?.toString();

  if (!bookId || !content || !author) {
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/review`,
      {
        method: "POST",
        body: JSON.stringify({ bookId, content, author }),
      }
    );
    console.log(response.status);
    //넥스트서버측에게 페이지를 다시 생성하도록 요청해서 서버액션의 결과를 바로 화면에 나타나게함
    //오직 서버측에서만 호출함 revalidatePath -> 해당 페이지를 재생성하면서 데이터캐싱이 force-cache더라도 다 삭제됨, 풀라우트 캐시도 삭제됨
    revalidatePath(`/book/${bookId}`);
  } catch (err) {
    console.log(err);
    return;
  }
}
