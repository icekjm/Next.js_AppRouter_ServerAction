import { notFound } from "next/navigation";
import style from "./page.module.css";
import { createReviewAction } from "@/actions/create-review.action";

//아래 설정을 하면, id가 1,2,3 외에 값은 모두 404 not found페이지가 호출됨
//export const dynamicParams = false;

//getStaticPath(페이지라우팅)의 AppRouter버전임
export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }]; //주의사항: id값을 문자열로만 써야함
}

async function BookDetail({ bookId }: { bookId: string }) {
  //GenerateStaticParams라는 함수를 내보내 주시게 되면 페이지 컴퍼넌트 내부에
  // 데이터 캐싱이 설정되지 않은 이러한 데이터 페칭인 fetch가 존재하게 될지라도 무조건 해당하는
  // 페이지가 static 페이지로서 강제로 설정이 된다는 점
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/${bookId}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    return <div>오류가 발생했습니다...</div>;
  }

  const book = await response.json();

  const { id, title, subTitle, description, author, publisher, coverImgUrl } =
    book;

  return (
    <section>
      <div
        className={style.cover_img_container}
        style={{ backgroundImage: `url('${coverImgUrl}')` }}
      >
        <img src={coverImgUrl} />
      </div>
      <div className={style.title}>{title}</div>
      <div className={style.subTitle}>{subTitle}</div>
      <div className={style.author}>
        {author} | {publisher}
      </div>
      <div className={style.description}>{description}</div>
    </section>
  );
}

//use server라는 지시자를 통해 서버액션을 만들고 해당하는 서버액션을 호출하는 form을 브라우저에서 제출하게되면
//자동으로 서버액션을 호출하는 HTTP 요청이 서버로 전송하게 되고
// 이런 서버액션들은 컴파일 결과 자동으로 특정 해시값을 갖는 API로서 설정이되서
//  request Header의 Next action이라는 항목에 위 특정 해시값이 나타남
function ReviewEditor({ bookId }: { bookId: string }) {
  return (
    <section>
      <form action={createReviewAction}>
        <input name="bookId" value={bookId} hidden readOnly />
        <input required name="content" placeholder="리뷰 내용"></input>
        <input required name="author" placeholder="작성자"></input>
        <button type="submit">작성하기</button>
      </form>
    </section>
  );
}

//props에서 params만 꺼내서 쓰기 위해 파라미터 첫번째와 같이 설정
//params는 Promise 객체임
//함수나 컴포넌트, 혹은 어떤 변수의 값이 "나중에 비동기적으로 도착"할 예정이라면 그 타입은 Promise<T>로 정의
//이 Promise가 나중에 { id: string | string[] }라는 객체 하나를 반환함 -> 이 객체 안에 있는 id라는 키의 값은 문자열(string) 혹은 문자열배열임(string{})

//아래 코드는 Next.js 15 이전버전에서는 잘되었으나, 15부터 params와 searchParams는 지연평가되어 아래처럼 처리하면안됨
// export default function Page({ params }: { params: { id: string } }) {
//   return (
//     <div className={style.container}>
//       <BookDetail bookId={params.id} />
//       <ReviewEditor />
//     </div>
//   );
// }

// 해결책1
// export default async function Page(props: { params: Promise<{ id: string }> }) {
//   const { id } = await props.params;

//   return (
//     <div className={style.container}>
//       <BookDetail bookId={id} />
//       <ReviewEditor />
//     </div>
//   );
// }

// 해결책2
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className={style.container}>
      <BookDetail bookId={id} />
      <ReviewEditor bookId={id} />
    </div>
  );
}
