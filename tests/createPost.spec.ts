import {test, expect} from '@playwright/test';
interface Params{
    id: number,
    date: string,
    title: {
        "raw": string,
        "rendered": string
    };
    content: {
        "raw": string,
        "rendered": string,
        "protected": boolean,
        "block_version": number
      };
      guid: {
        "rendered": string,
        "raw": string
      };
      categories: number[];
      modified: string;
      modified_gmt: string;
      password: string;
      slug: string;
      status: string;
      type: string;
      link: string;
      excerpt: {
        "raw": string,
        "rendered": string;
        "protected": boolean;
      };
    }
test.describe('createPost', () => {
const baseURL = 'https://dev.emeli.in.ua/wp-json/wp/v2';
const credentials = Buffer.from('admin:Engineer_123').toString('base64');
const perfomanceTimeOut = 15000;
test ('Створення статті - позитивний кейс' , async ({request}) => {
    const createStartTime = Date.now();
    const createData = {
        title: 'newTitle',
        content: 'newContent'
    }
    const createResponse = await request.post(`${baseURL}/posts`, {
        headers:{
            'Authorization':`Basic ${credentials}`,
            'Content-Type':'application/json'
        },
        data: createData
    })
    function stripHtml(html: string): string {
        return html.replace(/<[^>]*>/g, '').trim(); 
      }
    const realTime = Date.now() - createStartTime;
    expect (realTime).toBeLessThan(perfomanceTimeOut);
    expect (createResponse.status()).toBe(201);
    const createPost = await createResponse.json()as Params;
    expect (createPost.id).toBeTruthy();
    expect (createPost.title.rendered).toBe(createData.title);
    expect (createPost.title.raw).toBe(createData.title);
    expect (createPost.content.raw).toBe(createData.content);
    expect (stripHtml(createPost.content.rendered)).toContain(createData.content);
    expect (createPost.content.protected).toBe(false);
    expect (createPost.content.block_version).toBe(0);
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    expect (createPost.date).toMatch(isoDateRegex);
    const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
    expect (createPost.guid.raw).toMatch(urlRegex);
    expect (createPost.guid.raw).not.toBe('');
    expect (createPost.categories).toBeDefined();  // перевірка що поле існує//
    expect (Array.isArray(createPost.categories)).toBe(true);
    // expect (createPost.categories[1]).toBeTruthy();
    expect(createPost.categories.length).toBeGreaterThan(0);
    createPost.categories.forEach(category => {
      expect(typeof category).toBe("number");
    });
    expect (createPost.modified).toMatch(isoDateRegex);
    expect (createPost.modified_gmt).toMatch(isoDateRegex);
    expect(createPost.link).toMatch(urlRegex);
    expect(createPost.password).toBe('');
    expect(createPost.slug).toBe('');
    expect(createPost.password).toBeDefined();
    expect(createPost.slug).toBeDefined();
    const allowedStatuses = ["publish", "future", "draft", "pending", "private"];
    expect(allowedStatuses).toContain(createPost.status);
    expect(createPost.status).toBeDefined();
    expect(createPost.type).toBeDefined();
    expect(createPost.excerpt.raw).toBeDefined();
    expect (stripHtml(createPost.excerpt.rendered)).toContain(createData.content);
    expect (createPost.excerpt.protected).toBe(false);
    const editStartTime = Date.now();
    const updateData = {
      title: 'updateTitle',
      content: 'updateContent'
    }
    const updateResponse = await request.put(`${baseURL}/posts/${createPost.id}`, {
      headers:{
        'Authorization':`Basic ${credentials}`,
        'Content-Type':'application/json'
    },
    data: updateData
    })
    const editTime = Date.now() - editStartTime;
    expect (editTime).toBeLessThan(perfomanceTimeOut);
    expect(updateResponse.status()).toBe(200);
    console.log(`${createPost.id}`);
    const deleteResponse = await request.delete(`${baseURL}/posts/${createPost.id}?force=true`, {
      headers:{
        'Authorization':`Basic ${credentials}`,
        'Content-Type':'application/json'
    },
  })
  const deleteStartTime = Date.now();
  const deleteTime = Date.now() - deleteStartTime;
  expect (deleteTime).toBeLessThan(perfomanceTimeOut);
  expect (deleteResponse.status()).toBe(200);
  console.log(`${createPost.id}` + ` видалено`);
});
})