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

});
})