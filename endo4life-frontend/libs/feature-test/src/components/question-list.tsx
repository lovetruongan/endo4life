import { IQuestionEntity } from '../types';
import { QuestionCard } from './question-card';

interface Props {
  data: IQuestionEntity[];
}

export function QuestionList({ data }: Props) {
  return (
    <div>
      <h3>Question List</h3>
      <ul>
        {data.map((item) => {
          return (
            <li key={item.id}>
              <QuestionCard data={item} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
