// server-files/seo-ai-fixer.js
// AI-Powered SEO Fix Generator using OpenAI

const axios = require('axios');

class SEOAIFixer {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.model = 'gpt-4o-mini'; // Cost-effective model
  }

  /**
   * Generate fixes for multiple issues
   */
  async generateFixes(url, issues) {
    const fixes = [];

    for (const issue of issues) {
      try {
        let fix = null;

        switch (issue.category) {
          case 'title':
            fix = await this.generateTitleFix(url, issue);
            break;
          case 'meta':
            fix = await this.generateMetaDescriptionFix(url, issue);
            break;
          case 'images':
            fix = await this.generateAltTextFix(url, issue);
            break;
          case 'schema':
            fix = await this.generateSchemaFix(url, issue);
            break;
          case 'content':
            fix = await this.generateContentFix(url, issue);
            break;
          case 'headings':
            fix = await this.generateH1Fix(url, issue);
            break;
          case 'links':
            fix = await this.generateLinksFix(url, issue);
            break;
          case 'social':
            fix = await this.generateOpenGraphFix(url, issue);
            break;
          case 'technical':
            fix = await this.generateTechnicalFix(url, issue);
            break;
          case 'mobile':
            fix = await this.generateMobileFix(url, issue);
            break;
          case 'canonical':
            fix = await this.generateCanonicalFix(url, issue);
            break;
          case 'robots':
            fix = await this.generateRobotsFix(url, issue);
            break;
          case 'performance':
            fix = await this.generatePerformanceFix(url, issue);
            break;
          case 'accessibility':
            fix = await this.generateAccessibilityFix(url, issue);
            break;
          case 'keywords':
            fix = await this.generateKeywordsFix(url, issue);
            break;
          case 'url-structure':
            fix = await this.generateUrlStructureFix(url, issue);
            break;
          case 'broken-links':
            fix = await this.generateBrokenLinksFix(url, issue);
            break;
          case 'duplicate-content':
            fix = await this.generateDuplicateContentFix(url, issue);
            break;
          default:
            continue;
        }

        if (fix) {
          fixes.push({
            issueId: issue.id,
            fixType: issue.category,
            originalContent: issue.current_value,
            optimizedContent: fix.content,
            aiModel: this.model,
            confidenceScore: fix.confidence,
            keywords: fix.keywords || []
          });
        }
      } catch (error) {
        console.error(`Error generating fix for issue ${issue.id}:`, error.message);
      }
    }

    return fixes;
  }

  /**
   * Generate optimized title tag
   */
  async generateTitleFix(url, issue) {
    const currentTitle = issue.current_value || '';
    
    const prompt = `You are an SEO expert. Generate an optimized title tag for this webpage.

URL: ${url}
Current Title: ${currentTitle || 'None'}
Issue: ${issue.description}

Requirements:
- 50-60 characters long
- Include primary keyword naturally
- Compelling and click-worthy
- Unique and descriptive
- Front-load important keywords

Return ONLY the optimized title tag text, nothing else.`;

    const response = await this.callOpenAI(prompt);
    const optimizedTitle = response.trim();

    // Extract potential keywords
    const keywords = this.extractKeywords(optimizedTitle);

    return {
      content: optimizedTitle,
      confidence: this.calculateConfidence(optimizedTitle, 50, 60),
      keywords
    };
  }

  /**
   * Generate optimized meta description
   */
  async generateMetaDescriptionFix(url, issue) {
    const currentMeta = issue.current_value || '';
    
    const prompt = `You are an SEO expert. Generate an optimized meta description for this webpage.

URL: ${url}
Current Meta Description: ${currentMeta || 'None'}
Issue: ${issue.description}

Requirements:
- 150-160 characters long
- Include primary and secondary keywords naturally
- Compelling call-to-action
- Accurately summarize page content
- Encourage clicks from search results

Return ONLY the optimized meta description text, nothing else.`;

    const response = await this.callOpenAI(prompt);
    const optimizedMeta = response.trim();

    const keywords = this.extractKeywords(optimizedMeta);

    return {
      content: optimizedMeta,
      confidence: this.calculateConfidence(optimizedMeta, 150, 160),
      keywords
    };
  }

  /**
   * Generate alt text for images
   */
  async generateAltTextFix(url, issue) {
    const imageSrc = issue.current_value || '';
    
    const prompt = `You are an SEO expert. Generate descriptive alt text for an image.

Image URL: ${imageSrc}
Page URL: ${url}
Context: Image on a webpage that needs SEO-friendly alt text

Requirements:
- Descriptive and specific
- 125 characters or less
- Include relevant keywords naturally
- Describe what the image shows
- Useful for screen readers

Return ONLY the alt text, nothing else.`;

    const response = await this.callOpenAI(prompt);
    const altText = response.trim();

    return {
      content: altText,
      confidence: altText.length <= 125 ? 0.9 : 0.7,
      keywords: this.extractKeywords(altText)
    };
  }

  /**
   * Generate schema markup
   */
  async generateSchemaFix(url, issue) {
    const prompt = `You are an SEO expert. Generate JSON-LD schema markup for this webpage.

URL: ${url}
Issue: ${issue.description}

Generate appropriate schema markup. Common types:
- Article (for blog posts)
- Product (for product pages)
- Organization (for company pages)
- LocalBusiness (for local businesses)
- WebPage (general pages)

Return ONLY valid JSON-LD schema markup, nothing else. Start with <script type="application/ld+json"> and end with </script>.`;

    const response = await this.callOpenAI(prompt);
    
    // Validate JSON
    try {
      const jsonMatch = response.match(/<script[^>]*>(.*?)<\/script>/s);
      if (jsonMatch) {
        JSON.parse(jsonMatch[1]);
        return {
          content: response.trim(),
          confidence: 0.85,
          keywords: []
        };
      }
    } catch (e) {
      console.error('Invalid schema JSON:', e.message);
    }

    return null;
  }

  /**
   * Generate H1 heading
   */
  async generateH1Fix(url, issue) {
    const prompt = `You are an SEO expert. Generate an optimized H1 heading for this webpage.

URL: ${url}
Issue: ${issue.description}

Requirements:
- 20-70 characters long
- Include primary keyword
- Clear and descriptive
- Compelling and engaging
- Accurately represents page content
- Only ONE H1 per page

Return ONLY the H1 heading text, nothing else.`;

    const response = await this.callOpenAI(prompt);
    const h1Text = response.trim();

    return {
      content: h1Text,
      confidence: this.calculateConfidence(h1Text, 20, 70),
      keywords: this.extractKeywords(h1Text)
    };
  }

  /**
   * Generate content expansion suggestions
   */
  async generateContentFix(url, issue) {
    const currentWordCount = issue.current_value ? parseInt(issue.current_value) : 0;
    
    const prompt = `You are an SEO content expert. Generate content expansion suggestions for this thin content page.

URL: ${url}
Current Word Count: ${currentWordCount}
Issue: ${issue.description}

Provide 5 specific content suggestions to expand this page to at least 300 words:
1. Main topic to cover
2. Subtopics to include
3. Questions to answer
4. Examples or case studies
5. Call-to-action ideas

Format as a numbered list with brief explanations.`;

    const response = await this.callOpenAI(prompt);
    
    return {
      content: response.trim(),
      confidence: 0.85,
      keywords: []
    };
  }

  /**
   * Generate internal linking suggestions
   */
  async generateLinksFix(url, issue) {
    const currentLinks = issue.current_value ? parseInt(issue.current_value) : 0;
    
    const prompt = `You are an SEO expert. Suggest internal linking opportunities for this page.

URL: ${url}
Current Internal Links: ${currentLinks}
Issue: ${issue.description}

Suggest 5 internal linking opportunities:
1. Anchor text to use
2. Type of page to link to (e.g., "related blog post", "product category page")
3. Why this link helps SEO

Format as a numbered list with clear recommendations.`;

    const response = await this.callOpenAI(prompt);
    
    return {
      content: response.trim(),
      confidence: 0.80,
      keywords: []
    };
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert SEO specialist who creates optimized, compelling content that ranks well in search engines.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error('Failed to generate AI fix');
    }
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    // Simple keyword extraction - remove common words
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));

    // Count frequency
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Return top keywords
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Calculate confidence score based on length
   */
  calculateConfidence(text, minLength, maxLength) {
    const length = text.length;
    
    if (length >= minLength && length <= maxLength) {
      return 0.95;
    } else if (length >= minLength - 10 && length <= maxLength + 10) {
      return 0.85;
    } else if (length >= minLength - 20 && length <= maxLength + 20) {
      return 0.75;
    } else {
      return 0.65;
    }
  }

  /**
   * Generate Open Graph tags fix
   */
  async generateOpenGraphFix(url, issue) {
    const prompt = `You are an SEO expert. Generate Open Graph meta tags for social media sharing.

URL: ${url}
Issue: ${issue.description}

Generate complete Open Graph tags including:
- og:title
- og:description
- og:type
- og:url
- og:image (suggest placeholder)

Return ONLY the HTML meta tags, one per line, nothing else.`;

    const response = await this.callOpenAI(prompt);
    
    return {
      content: response.trim(),
      confidence: 0.90,
      keywords: []
    };
  }

  /**
   * Generate Technical SEO fixes (canonical, robots)
   */
  async generateTechnicalFix(url, issue) {
    if (issue.title.includes('Canonical')) {
      return {
        content: `<link rel="canonical" href="${url}" />`,
        confidence: 0.95,
        keywords: []
      };
    }
    
    if (issue.title.includes('Robots') || issue.title.includes('noindex')) {
      const prompt = `You are an SEO expert. The page has a robots meta tag blocking indexing.

URL: ${url}
Issue: ${issue.description}

Provide the correct robots meta tag to allow indexing.
Return ONLY the HTML meta tag, nothing else.`;

      const response = await this.callOpenAI(prompt);
      
      return {
        content: response.trim(),
        confidence: 0.90,
        keywords: []
      };
    }

    return null;
  }

  /**
   * Generate Mobile/Viewport fix
   */
  async generateMobileFix(url, issue) {
    if (issue.title.includes('Viewport')) {
      return {
        content: '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">',
        confidence: 0.95,
        keywords: []
      };
    }

    return null;
  }

  /**
   * Generate internal link suggestions
   */
  async generateInternalLinks(url, pageContent, existingLinks) {
    const prompt = `You are an SEO expert. Suggest 3-5 internal link opportunities for this page.

Page URL: ${url}
Existing Internal Links: ${existingLinks.length}

Analyze the content and suggest:
1. Anchor text for internal links
2. Suggested target pages (describe the type of page)
3. Why this link would be valuable

Format as JSON array:
[
  {
    "anchorText": "suggested anchor text",
    "targetPageType": "description of target page",
    "reason": "why this link helps SEO"
  }
]

Return ONLY the JSON array, nothing else.`;

    try {
      const response = await this.callOpenAI(prompt);
      const suggestions = JSON.parse(response);
      return suggestions;
    } catch (error) {
      console.error('Error generating internal links:', error.message);
      return [];
    }
  }

  /**
   * Generate canonical URL fix
   */
  async generateCanonicalFix(url, issue) {
    const prompt = `You are an SEO expert. Generate the correct canonical URL tag for this page.

URL: ${url}
Issue: ${issue.description}
Current Value: ${issue.current_value || 'None'}

Requirements:
- Use the primary URL version (https, www or non-www)
- Ensure it's the preferred URL for this content
- Include full absolute URL

Return ONLY the canonical URL (just the URL, not the full tag), nothing else.`;

    const response = await this.callOpenAI(prompt);
    const canonicalUrl = response.trim();

    return {
      content: `<link rel="canonical" href="${canonicalUrl}" />`,
      confidence: 0.9,
      keywords: []
    };
  }

  /**
   * Generate robots meta tag fix
   */
  async generateRobotsFix(url, issue) {
    const prompt = `You are an SEO expert. Generate the appropriate robots meta tag for this page.

URL: ${url}
Issue: ${issue.description}
Current Value: ${issue.current_value || 'None'}

Common directives:
- index/noindex - Allow/prevent indexing
- follow/nofollow - Allow/prevent following links
- noarchive - Prevent cached copy
- nosnippet - Prevent snippet in search results

Return ONLY the robots directive (e.g., "index, follow"), nothing else.`;

    const response = await this.callOpenAI(prompt);
    const robotsDirective = response.trim();

    return {
      content: `<meta name="robots" content="${robotsDirective}" />`,
      confidence: 0.85,
      keywords: []
    };
  }

  /**
   * Generate performance optimization suggestions
   */
  async generatePerformanceFix(url, issue) {
    const prompt = `You are a web performance expert. Provide specific optimization recommendations for this issue.

URL: ${url}
Issue: ${issue.description}
Current Value: ${issue.current_value || 'None'}

Focus on:
- Image optimization
- Code minification
- Caching strategies
- Critical CSS
- Lazy loading
- Resource hints

Provide 3-5 actionable recommendations in a concise list format.`;

    const response = await this.callOpenAI(prompt);

    return {
      content: response.trim(),
      confidence: 0.8,
      keywords: ['performance', 'speed', 'optimization']
    };
  }

  /**
   * Generate accessibility fix
   */
  async generateAccessibilityFix(url, issue) {
    const prompt = `You are a WCAG accessibility expert. Generate a fix for this accessibility issue.

URL: ${url}
Issue: ${issue.description}
Current Value: ${issue.current_value || 'None'}

Requirements:
- WCAG 2.1 Level AA compliance
- Screen reader friendly
- Keyboard navigation support
- Proper ARIA labels
- Color contrast requirements

Provide the specific HTML/code fix needed.`;

    const response = await this.callOpenAI(prompt);

    return {
      content: response.trim(),
      confidence: 0.85,
      keywords: ['accessibility', 'a11y', 'wcag']
    };
  }

  /**
   * Generate keyword optimization fix
   */
  async generateKeywordsFix(url, issue) {
    const prompt = `You are an SEO keyword expert. Optimize the content for better keyword usage.

URL: ${url}
Issue: ${issue.description}
Current Content: ${issue.current_value || 'None'}

Requirements:
- Natural keyword integration
- Avoid keyword stuffing
- Use semantic variations
- Maintain readability
- Target primary and secondary keywords

Return the optimized content with better keyword usage.`;

    const response = await this.callOpenAI(prompt);
    const optimizedContent = response.trim();
    const keywords = this.extractKeywords(optimizedContent);

    return {
      content: optimizedContent,
      confidence: 0.8,
      keywords
    };
  }

  /**
   * Generate URL structure fix
   */
  async generateUrlStructureFix(url, issue) {
    const prompt = `You are an SEO expert. Suggest an optimized URL structure for this page.

Current URL: ${url}
Issue: ${issue.description}

Requirements:
- Short and descriptive
- Use hyphens, not underscores
- Include primary keyword
- Lowercase only
- Remove unnecessary parameters
- Logical hierarchy

Return ONLY the optimized URL path (e.g., /category/product-name), nothing else.`;

    const response = await this.callOpenAI(prompt);
    const optimizedUrl = response.trim();

    return {
      content: optimizedUrl,
      confidence: 0.75,
      keywords: this.extractKeywords(optimizedUrl)
    };
  }

  /**
   * Generate broken links fix
   */
  async generateBrokenLinksFix(url, issue) {
    const brokenUrl = issue.current_value || '';
    
    const prompt = `You are an SEO expert. Suggest a fix for this broken link.

Page URL: ${url}
Broken Link: ${brokenUrl}
Issue: ${issue.description}

Suggest:
1. If it should be removed
2. If it should be redirected (suggest target)
3. If it should be updated (suggest correct URL)

Provide a brief, actionable recommendation.`;

    const response = await this.callOpenAI(prompt);

    return {
      content: response.trim(),
      confidence: 0.7,
      keywords: []
    };
  }

  /**
   * Generate duplicate content fix
   */
  async generateDuplicateContentFix(url, issue) {
    const prompt = `You are an SEO content expert. Provide a solution for this duplicate content issue.

URL: ${url}
Issue: ${issue.description}
Current Content: ${issue.current_value ? issue.current_value.substring(0, 200) : 'None'}

Solutions may include:
- Canonical tags
- 301 redirects
- Content consolidation
- Noindex tags
- Unique content rewrite

Provide specific recommendations for this case.`;

    const response = await this.callOpenAI(prompt);

    return {
      content: response.trim(),
      confidence: 0.75,
      keywords: []
    };
  }

  /**
   * Batch generate fixes for multiple pages
   */
  async batchGenerateFixes(pages) {
    const results = [];

    for (const page of pages) {
      try {
        const fixes = await this.generateFixes(page.url, page.issues);
        results.push({
          url: page.url,
          fixes,
          success: true
        });
      } catch (error) {
        results.push({
          url: page.url,
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }
}

module.exports = new SEOAIFixer();
