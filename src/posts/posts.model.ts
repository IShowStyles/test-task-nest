import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({ tableName: 'posts' })
export class Post extends Model<Post> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER })
  userId: number;

  @Column({ type: DataType.STRING })
  title: string;

  @Column({ type: DataType.TEXT })
  body: string;
}
