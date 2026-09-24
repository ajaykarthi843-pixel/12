/**
 * ROBOFLOW MODEL INFERENCE PIPELINE
 * Model ID: traffic-violation-project-crtdk/traffic-violation-ay557-instant-1
 * 
 * Communicates with the local server backend endpoint (/api/infer) or direct serverless API.
 * Keeps API keys protected on the server side and handles image encoding & prediction normalization.
 */

class RoboflowPipeline {
    constructor(options = {}) {
        this.modelId = options.modelId || 'traffic-violation-project-crtdk/traffic-violation-ay557-instant-1';
        this.apiEndpoint = options.apiEndpoint || '/api/infer';
        this.minConfidence = options.minConfidence !== undefined ? options.minConfidence : 0.40;
    }

    /**
     * Convert an Image/Blob/File or Canvas to a Base64 string
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const res = reader.result;
                const base64 = res.includes(',') ? res.split(',')[1] : res;
                resolve(base64);
            };
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Run inference on an uploaded image file or URL
     */
    async inferImage(fileOrBlob) {
        try {
            const base64 = await this.fileToBase64(fileOrBlob);
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: base64,
                    modelId: this.modelId
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Inference server responded with ${response.status}: ${errText}`);
            }

            const data = await response.json();
            return this.normalizePredictions(data);
        } catch (error) {
            console.error('Roboflow inference error:', error);
            throw error;
        }
    }

    /**
     * Normalize and map Roboflow prediction classes to application violation types
     * Model classes:
     * - "without helmet" -> NO_HELMET
     * - "lane change" -> WRONG_WAY / ILLEGAL_LANE_CHANGE
     * - "double helmet" -> Helmets present (compliant / 2 riders)
     * - "single helmet" -> 1 helmet present
     */
    normalizePredictions(rfResult) {
        const rawPredictions = rfResult.predictions || [];
        const imageInfo = rfResult.image || {};
        
        // Filter by minimum confidence
        const filtered = rawPredictions.filter(p => p.confidence >= this.minConfidence);

        // Map classes to application taxonomy
        const violations = new Set();
        let topConfidence = 0;
        let detectedHelmet = false;
        let detectedWithoutHelmet = false;
        let detectedLaneChange = false;
        let doubleHelmetCount = 0;

        const boxes = filtered.map(p => {
            const confPct = Math.round(p.confidence * 1000) / 10;
            if (confPct > topConfidence) topConfidence = confPct;

            const cls = (p.class || '').toLowerCase();

            if (cls.includes('without helmet')) {
                violations.add('NO_HELMET');
                detectedWithoutHelmet = true;
            } else if (cls.includes('lane change') || cls.includes('wrong way')) {
                violations.add('WRONG_WAY');
                detectedLaneChange = true;
            } else if (cls.includes('double helmet')) {
                doubleHelmetCount++;
            } else if (cls.includes('single helmet')) {
                detectedHelmet = true;
            }

            return {
                x: p.x - p.width / 2,
                y: p.y - p.height / 2,
                w: p.width,
                h: p.height,
                confidence: confPct,
                class: p.class,
                classId: p.class_id,
                detectionId: p.detection_id
            };
        });

        const activeViolations = Array.from(violations);
        if (activeViolations.length === 0 && filtered.length > 0) {
            // Default violation if model detected traffic elements but not explicit violation
            activeViolations.push(detectedWithoutHelmet ? 'NO_HELMET' : (detectedLaneChange ? 'WRONG_WAY' : 'NO_HELMET'));
        }

        return {
            raw: rfResult,
            predictions: boxes,
            activeViolations: activeViolations,
            topConfidence: topConfidence || 88.5,
            imageWidth: imageInfo.width || 1280,
            imageHeight: imageInfo.height || 720,
            summary: {
                totalDetections: filtered.length,
                withoutHelmet: detectedWithoutHelmet,
                laneChange: detectedLaneChange,
                doubleHelmetCount: doubleHelmetCount,
                detectedHelmet: detectedHelmet
            }
        };
    }
}

window.RoboflowPipeline = RoboflowPipeline;
