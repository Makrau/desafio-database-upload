import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async findOrCreate(title: string): Promise<Category> {
    const existentCategory = await this.findOne({
      where: { title },
    });

    if (existentCategory) {
      return existentCategory;
    }

    const createdCategory = await this.create({ title });
    await this.save(createdCategory);

    return createdCategory;
  }
}

export default CategoriesRepository;
