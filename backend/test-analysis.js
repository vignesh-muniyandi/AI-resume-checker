const { extractTextFromDocument } = require('./src/documentParser');
const { analyzeResumeWithAI } = require('./src/aiAnalyzer');

async function test() {
    try {
        const file1 = './uploads/resume-1775804163843-480887592.pdf';
        console.log('Testing file 1...');
        let text1 = await extractTextFromDocument(file1, 'application/pdf');
        console.log('Text 1 extracted length:', text1.length);
        await analyzeResumeWithAI(text1, 'developer');
        console.log('File 1 SUCCESS!');

        const file2 = './uploads/resume-1775809037534-44631564.pdf';
        console.log('Testing file 2...');
        let text2 = await extractTextFromDocument(file2, 'application/pdf');
        console.log('Text 2 extracted length:', text2.length);
        await analyzeResumeWithAI(text2, 'developer');
        console.log('File 2 SUCCESS!');
    } catch (err) {
        console.error('FATAL ERROR:', err);
        console.error(err.stack);
    }
}

test();
