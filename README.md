# 예산 관리 애플리케이션

사용자들이 개인 재무를 관리하고 지출을 추적할 수 있는 애플리케이션입니다. 이 앱은 사용자들이 지출을 모니터링하며 재무 목표를 달성하는 데 도움이 됩니다.

### 예산

-   사용자는 월마다 카테고리별 예산을 설정하고 월 전체 예산을 확인할 수 있습니다.

### 지출

-   사용자는 발생한 지출에 대해 등록, 수정, 삭제, 조회를 할 수 있으며 월별 지출 내역(조건 지정 가능)을 확인할 수 있습니다.
-   설정한 월별 예산을 만족하기 위해 전체 및 카테고리별 남은 예산을 제공합니다.
-   오늘 발생한 지출 내역을 확인하고 카테고리별 사용 적정 금액과 위험도를 알려줍니다.
-   오늘까지 소비한 금액을 지난달 같은 일자와 비교하여 지난달 대비 카테고리별 소비율을 확인할 수 있습니다.
-   오늘 소비한 금액을 지난주 같은 요일과 비교하여 지난 요일 대비 소비율을 확인할 수 있습니다.

## Skills

<img src="https://img.shields.io/badge/Node.js-v 18-339933">&nbsp;
<img src="https://img.shields.io/badge/Nest.js-v 10.2-E0234E">&nbsp;
<img src="https://img.shields.io/badge/TypeScript-v 5.0-3178C6"><br>
<img src="https://img.shields.io/badge/TypeORM-v 0.3-fcad03">&nbsp;
<img src="https://img.shields.io/badge/postgreSQL-v 16.1-4169E1">&nbsp;
<img src="https://img.shields.io/badge/Docker-v 24.0.6-2496ED">&nbsp;

## ERD

<img width="1091" alt="스크린샷 2023-11-18 오후 9 43 47" src="https://github.com/pre-onboarding-backend-F/3_BudgetManagement_F_haeseung123/assets/106800437/e0176a89-45ac-4765-94b5-71bcd909bea1">

-   새로운 카테고리를 추가하거나 예산을 수정하는 등 변경을 용이하게 하기위해 각 테이블을 독립적으로 관리할 수 있도록 테이블을 분할하였습니다.
-   monthly_budget, monthly_expend를 사용하여 특정 월에 사용자의 모든 예산과 지출을 찾을 수 있기 때문에 필요한 정보를 빠르게 찾을 수 있습니다.

## 실행 방법

```
# docker 빌드
npm run docker:build

# docker 실행
npm run docker:start
```

실행을 위해서는 루트 디렉터리에 .development.env 파일이 필요합니다.

<details>
  <summary> 환경변수 설정 </summary>
  
  ```
  SERVER_PORT=

POSTGRESQL_USER=
POSTGRESQL_PASSWORD=
POSTGRESQL_HOST=
POSTGRESQL_PORT=
POSTGRESQL_DATABASE=
POSTGRESQL_SYNCHRONIZE=
POSTGRESQL_LOGGING=

JWT_ACCESS_SECRET_KEY=
JWT_ACCESS_EXPIRATION_TIME=
JWT_REFRESH_SECRET_KEY=
JWT_REFRESH_EXPIRATION_TIME=

```

</details>

## API 명세
API 명세와 요청에 따른 응답 메시지가 정리된 노션페이지입니다.

[API 명세서🔗](https://admitted-podium-88c.notion.site/API-64288645d6c940eb80da090c87b0f6f0?pvs=4)

## 주요 기능

<details>
<summary> 지출 컨설팅 </summary>

<br>

오늘 발생한 지출 내역을 확인하고 카테고리별 사용 적정 금액과 위험도를 알려줌으로써 예산 관리를 도와주는 API

- #### 오늘 지출 추천

  - 현재 날짜를 기반으로 한 해와 월을 계산하고, 사용자의 월별 예산 및 지출 데이터를 가져옵니다.

  - 남은 예산과 날짜를 기반으로 남은 예산과 일일 추천 예산을 계산하고 남은 예산에 따라 사용자에게 메시지를 생성하여 반환합니다.
    - 사용자에게 전달되는 메시지는 긍정적/부정적인 의미를 내포하여 사용자와여 상호작용을 높이고 긍정적인 경험을 제공합니다.

  - 각 카테고리에 대한 지출 내역을 바탕으로 카테고리별 남은 예산을 알려줍니다.
    - 이는 카테고리별 사용 적정 금액과 위험도를 판단하는 데 사용됩니다.

  - 최종적으로 남은 월 예산, 유저 메시지, 일 별 추천 예산, 카테고리별 남은 예산을 반환합니다.

- #### 오늘 지출 안내

  - 이번달 지출 내역에서 오늘 지출을 확인하고 카테고리 별로 금액을 계산합니다.

  - 예산 정보와 이번 달의 총 일 수를 기반으로 각 카테고리별 적정 금액을 계산합니다.
    - 일자별로 나누어진 적정 그액을 반환하여 사용자가 얼마나 지출했는지 비교합니다.

  - 주어진 예산과 실제 지출 금액을 기반으로 위험도(증가 퍼센트)를 계산합니다.
    - 예산을 초과한 경우 초과한 비율을 계산하여 위험도로 표시하고 초과하지 않는 경우 0%로 설정됩니다.

  - 최종적으로 오늘 지출 내역, 지출 총액, 적정 금액, 위험도를 반환합니다.


</details>

<details>
<summary> 지출 통계 </summary>

<br>

지난 달, 지난 주 대비 소비율을 나타내 사용자의 예산 관리를 도와주는 API

- #### 지난 달, 지난 주 대비 소비율

  - 현재 날짜를 기준으로 지난 달과 일주일 전의 연도와 월을 계산합니다.

  - 사용자의 월별 지출 내역, 지난 달과 일주일 전의 지출 내역을 조회합니다.

  - 현재 날짜까지의 지출 내역과 지난 달 대비 총액 소비율, 일주일 전 대비 소비율을 계산합니다.

    - 지난 달 대비 소비율
      - 현재와 지난 달의 각 카테고리별 지출 내역을 비교하여 소비율을 계산합니다.
      - 각 카테고리의 지출 흐름을 분석하고 지난 달 대비 어떤 카테고리가 증가했는지를 사용자에게 제공합니다.

    - 지난 주 대비 소비율
      - 현재 날짜의 지출 금액과 일주일 전의 지출 금액을 이용하여 일주일 전 대비 증가한 비율을 계산합니다.
      - 현재와 일주일 전의 지출을 비교하여 사용자에게 소비 흐름을 제공합니다.


</details>

## 고려 사항

#### 가독성 및 모듈화

- 코드를 이해하기 쉽도록 여러 함수로 분리하여 함수별로 특정 기능을 수행하도록 하였습니다.
- 코드의 재사용성을 향상시키기 위해 함수 간의 종속성을 최소화 하고 필요한 데이터만 전달하여 함수의 독립성을 유지할 수 있도록 하였습니다.

#### 중복 코드를 최소화하기 위한 노력

- 예산 설정시 DTO를 활용하여 예산 데이터 유효성 검사 진행
- applyDecorator 함수를 사용하여 중복되는 데코레이터를 별도의 커스텀 데코레이터로 분리하고 중복 코드를 최소화 하였습니다.

<details>
<summary> 개선 전 </summary>

- create-budget.dto.ts

```

import { IsNotEmpty, IsString, Matches, IsNumber, IsInt, Min } from 'class-validator';

export class CreateBudgetDto {
...
@IsNumber({}, { message: () => `${propertyName} 예산은 숫자 형식이어야 합니다.` }),
@IsInt({ message: () => `${propertyName} 예산은 정수로 입력되어야 합니다.` }),
@Min(0, { message: () => `${propertyName} 예산은 0 이상이어야 합니다.` }),  
 education: number;

... // 카테고리 별로 적용

@IsNumber({}, { message: () => `${propertyName} 예산은 숫자 형식이어야 합니다.` }),
@IsInt({ message: () => `${propertyName} 예산은 정수로 입력되어야 합니다.` }),
@Min(0, { message: () => `${propertyName} 예산은 0 이상이어야 합니다.` }),  
 occasion: number;
}

```

- 코드의 양이 많아져 가독성이 저하되고 데코레이터가 동일한 로직으로 반복되어 코드가 중복될 수 있는 여지가 있음
- 이는 오류의 가능성을 높이고 변경이 필요한 경우 모든 위치에서 수정해야하는 불편함 초래 -> 유지보수를 어렵게 만들고 변경사항을 놓치기 쉽게 함

</details>


<details>
  <summary> 개선 후 </summary>

  - isBudget.decorator.ts

```

import { applyDecorators } from '@nestjs/common';
import { IsInt, IsNumber, Min } from 'class-validator';

export function IsBudget(propertyName: string) {
return applyDecorators(
IsNumber({}, { message: () => `${propertyName} 예산은 숫자 형식이어야 합니다.` }),
IsInt({ message: () => `${propertyName} 예산은 정수로 입력되어야 합니다.` }),
Min(0, { message: () => `${propertyName} 예산은 0 이상이어야 합니다.` }),
);
}

```

- create-budget.dto.ts

```

import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsBudget } from '../decorators/isBudget.decorator';

export class CreateBudgetDto {
...
@IsBudget('교육')
education: number;

... // 카테고리 별로 적용

@IsBudget('경조사')
occasion: number;
}

```

- IsBudget 데코레이터를 사용함으로써 DTO 클래스가 간결해져 코드의 가독성이 향상됨
- 예산 설정 검증 로직이 중복되지 않고 하나의 데코레이터로 통합되어 로직 변경 시 중복 수정을 방지하고 코드 유지보수를 용이하게 만듦

</details>

#### 에러 핸들링
- 에러 응답 필터를 생성하여 통일된 에러 페이지를 제공하였습니다.
- 에러 전역 설정을 통해 일관된 오류를 처리하고 응답 관리를 제공하였습니다.
- 404 Not Found : 존재하지 않는 페이지 또는 리소스를 요청할 때 클라이언트에게 명확한 오류 메시지 제공
- 406 Not Acceptable : CustomParseUUIDPipe를 생성하고 잘못된 UUID 형식으로 파라미터를 받았을 때 클라이언트가 올바른 요청을 보낼 수 있도록 함
- 그밖에 ExceptionObjError enum 타입으로 에러 유형을 명확하게 구분하고 서버 응답 상태 코드와 연동하여 클라이언트에게 올바른 응답을 전달할 수 있도록 함




## TIL
프로젝트를 진행하며 작성한 TIL 노션페이지 입니다.

[HTTP status code🔗](https://admitted-podium-88c.notion.site/status-code-3547f9fe8f4d450f806578784b5ac7a9?pvs=4)
[중복되는 데코레이터 합치기🔗](https://admitted-podium-88c.notion.site/applyDecorator-5131e691a46c486c8fc588851b58308c?pvs=4)


```
