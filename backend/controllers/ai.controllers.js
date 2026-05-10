const Utils = require('../service/utils');

const PAGE_TITLES = {
    analytics: 'Аналитика',
    sales: 'Продажи / Касса',
    products: 'Товары',
    categories: 'Категории',
    warehouse: 'Склад',
    expenses: 'Расходы',
    income: 'Доходы',
    suppliers: 'Поставщики',
    customers: 'Клиенты',
    currency: 'Обмен валют',
    shifts: 'Смены',
    notifications: 'Уведомления',
    settings: 'Настройки',
    abc: 'ABC анализ',
    purchases: 'Закупки',
    profile: 'Профиль',
};

const PAGE_SUGGESTIONS = {
    analytics: [
        'Что делать дальше?',
        'Какие товары заканчиваются?',
        'Почему прибыль низкая?',
        'Как улучшить продажи?',
    ],
    sales: [
        'Как оформить продажу?',
        'Как применить скидку?',
        'Как продать в долг?',
        'Как отменить продажу?',
    ],
    products: [
        'Как добавить товар?',
        'Как установить минимальный остаток?',
        'Как добавить штрих-код?',
        'Какие товары заканчиваются?',
    ],
    categories: [
        'Как создать категорию?',
        'Зачем нужны категории?',
    ],
    warehouse: [
        'Как принять товар?',
        'Как списать товар?',
        'Что такое минимальный остаток?',
    ],
    expenses: [
        'Как добавить расход?',
        'Как создать категорию расходов?',
    ],
    suppliers: [
        'Как добавить поставщика?',
        'Как связать поставщика с закупкой?',
    ],
    customers: [
        'Как добавить клиента?',
        'Как посмотреть историю покупок клиента?',
    ],
    default: [
        'Что я могу сделать в системе?',
        'Покажи отчёт за сегодня',
        'Какие товары заканчиваются?',
    ],
};

const HELP_RESPONSES = {
    sales: [
        'Чтобы оформить продажу: откройте раздел «Продажи», в форме слева выберите товар из dropdown — он попадёт в корзину. Кнопками +/− меняйте количество. Внизу выберите способ оплаты, при необходимости укажите клиента и нажмите «Провести продажу». Остаток на складе уменьшится автоматически. Номер чека формируется как `S-2026-NNNNN`.',
        'Скидку пока можно установить только программно — поле discount уйдёт в API. В UI отдельной кнопки скидки сейчас нет, скоро добавим.',
        'Аннулировать продажу: в истории продаж справа кликните на нужный чек → в диалоге кнопка «Аннулировать». Остатки автоматически вернутся на склад.',
    ],
    products: [
        'Добавить товар: раздел «Товары» → кнопка «Новый товар» в шапке → заполните название, SKU, цену, остаток и категорию. SKU должен быть уникальным.',
        'Минимальный остаток (minStockLevel) пока не настраивается через UI — добавим в следующей итерации. Сейчас остаток подсвечивается красным при stock=0, жёлтым при stock<5, зелёным иначе.',
    ],
    categories: [
        'Создать категорию: раздел «Категории» → «Новая категория» → название обязательно, slug сгенерируется автоматически. Цвет в формате #RRGGBB управляет цветовой меткой в списке.',
    ],
    default: [
        'Я AI-копилот системы Sales System. Сейчас я работаю в режиме базовых подсказок — для подключения полноценного AI добавьте `ANTHROPIC_API_KEY` в `backend/.env` и перезапустите сервер.',
        'Доступные разделы: Продажи (касса), Товары, Категории, Склад, Закупки, Расходы, Доходы, Поставщики, Клиенты, Аналитика. Спросите про любой — расскажу подробнее.',
    ],
};

function pickResponse(message, page) {
    const m = (message || '').toLowerCase();
    const pageHints = HELP_RESPONSES[page] || [];

    // Keyword → response
    if (/прода|чек|касс|оплат/.test(m)) return HELP_RESPONSES.sales[0];
    if (/скид/.test(m)) return HELP_RESPONSES.sales[1];
    if (/отмен|аннулир|возвра/.test(m)) return HELP_RESPONSES.sales[2];
    if (/добав.*товар|новый товар/.test(m)) return HELP_RESPONSES.products[0];
    if (/мин.*остат|low stock|закан/.test(m)) return HELP_RESPONSES.products[1];
    if (/категор/.test(m)) return HELP_RESPONSES.categories[0];

    // Page-aware fallback
    if (pageHints.length > 0) return pageHints[0];

    return HELP_RESPONSES.default[Math.floor(Math.random() * HELP_RESPONSES.default.length)];
}

async function callDeepSeek(message, history, systemPrompt) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return null;
    try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
                max_tokens: 800,
                temperature: 0.6,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
                    { role: 'user', content: message },
                ],
            }),
        });
        if (!res.ok) {
            const txt = await res.text();
            console.error('DeepSeek error', res.status, txt);
            return null;
        }
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        return typeof content === 'string' ? content : null;
    } catch (err) {
        console.error('DeepSeek call failed', err);
        return null;
    }
}

async function callAnthropic(message, history, systemPrompt) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;
    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 800,
                system: systemPrompt,
                messages: [
                    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
                    { role: 'user', content: message },
                ],
            }),
        });
        if (!res.ok) {
            const txt = await res.text();
            console.error('Anthropic error', res.status, txt);
            return null;
        }
        const data = await res.json();
        const block = (data.content || []).find((b) => b.type === 'text');
        return block ? block.text : null;
    } catch (err) {
        console.error('Anthropic call failed', err);
        return null;
    }
}

async function callLLM(message, history, systemPrompt) {
    // Priority: DeepSeek → Anthropic → null (then fallback canned responses)
    const fromDeepSeek = await callDeepSeek(message, history, systemPrompt);
    if (fromDeepSeek) return { text: fromDeepSeek, source: 'deepseek' };
    const fromAnthropic = await callAnthropic(message, history, systemPrompt);
    if (fromAnthropic) return { text: fromAnthropic, source: 'anthropic' };
    return null;
}

exports.suggestions = async function (req, res) {
    const page = (req.query.page || 'default').toString();
    const items = PAGE_SUGGESTIONS[page] || PAGE_SUGGESTIONS.default;
    return res.status(200).json(Utils.envelope({
        body: {
            page,
            pageTitle: PAGE_TITLES[page] || 'Система',
            suggestions: items,
        },
    }));
};

exports.chat = async function (req, res) {
    try {
        const { message, page = 'default', history = [] } = req.body || {};
        if (Utils.isEmpty(message)) {
            return res.status(400).json(Utils.envelope({
                code: '8001',
                message: 'Message is required',
            }));
        }

        const pageTitle = PAGE_TITLES[page] || 'Система';
        const systemPrompt = `Ты — AI-копилот для системы управления продажами и складом «Sales System».
Пользователь сейчас на странице "${pageTitle}".
Отвечай кратко, по-русски, на «вы». Используй эмодзи умеренно. Если вопрос о действии — давай пошаговую инструкцию.
Доступные разделы системы: Продажи, Товары, Категории, Склад, Закупки, Расходы, Доходы, Обмен валют, Поставщики, Клиенты, Аналитика, Смены, Настройки.`;

        const aiResult = await callLLM(message, history, systemPrompt);
        const answer = aiResult?.text || pickResponse(message, page);

        return res.status(200).json(Utils.envelope({
            body: {
                role: 'assistant',
                content: answer,
                source: aiResult?.source || 'fallback',
            },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};
